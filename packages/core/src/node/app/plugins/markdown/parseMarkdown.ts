/* eslint-disable import/no-named-as-default-member */

import Markdoc, {
  type Node,
  type RenderableTreeNode,
  type Tag,
} from '@markdoc/markdoc';
import fs from 'fs';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import LRUCache from 'lru-cache';
import path from 'upath';

import {
  escapeHTML,
  isLinkExternal,
  type MarkdownFrontmatter,
  type MarkdownHeading,
  type MarkdownMeta,
  type ServerPage,
} from '../../../../shared';
import type { App } from '../../App';
import { resolveStaticRouteFromFilePath } from '../pages';
import { renderMarkdocToHTML } from './render';

export type MarkdocTreeNodeTransformer = (data: {
  node: RenderableTreeNode;
  stuff: MarkdocTreeWalkStuff;
}) => void;

export type MarkdocAstTransformer = (data: {
  ast: Node;
  filePath: string;
  source: string;
}) => void;

export type MarkdocContentTransformer = (data: {
  filePath: string;
  content: RenderableTreeNode;
  frontmatter: MarkdownFrontmatter;
}) => string;

export type MarkdocOutputTransformer = (data: {
  filePath: string;
  code: string;
  imports: string[];
  stuff: MarkdocTreeWalkStuff;
  meta: MarkdownMeta;
}) => string;

export type MarkdocRenderer = (data: {
  filePath: string;
  content: RenderableTreeNode;
  imports: string[];
  stuff: MarkdocTreeWalkStuff;
  meta: MarkdownMeta;
}) => string;

export type ParseMarkdownConfig = {
  ignoreCache?: boolean;
  filter: (id: string) => boolean;
  highlight: HighlightCodeBlock;
  transformAst: MarkdocAstTransformer[];
  transformTreeNode: MarkdocTreeNodeTransformer[];
  transformContent: MarkdocContentTransformer[];
  transformOutput: MarkdocOutputTransformer[];
  render: MarkdocRenderer;
};

export type ParseMarkdownResult = {
  filePath: string;
  output: string;
  meta: MarkdownMeta;
  ast: Node;
  stuff: MarkdocTreeWalkStuff;
  content: RenderableTreeNode;
};

const cache = new LRUCache<string, ParseMarkdownResult>({ max: 1024 });
const cacheK = new LRUCache<string, string>({ max: 1024 });

export function clearMarkdownCache(file?: string) {
  if (!file) {
    cache.reset();
  } else {
    cache.del(cacheK.get(file) ?? '');
  }
}

export function parseMarkdown(
  app: App,
  filePath: string,
  source: string,
  opts: Partial<ParseMarkdownConfig> = {},
): ParseMarkdownResult {
  const cacheKey = source;

  if (!opts.ignoreCache && cache.has(cacheKey)) return cache.get(source)!;

  const ast = Markdoc.parse(source, filePath);

  for (const transformer of opts.transformAst ?? []) {
    transformer({ filePath, ast, source });
  }

  const frontmatter: MarkdownFrontmatter = ast.attributes.frontmatter
    ? yaml.load(ast.attributes.frontmatter)
    : {};

  const nodeImports = app.markdoc.resolveImports(filePath);
  const config = app.markdoc.getConfig(filePath);
  const lastUpdated = Math.round(fs.statSync(filePath).mtimeMs);

  const content = Markdoc.transform(ast, {
    ...config,
    variables: {
      ...config.variables,
      frontmatter,
    },
  });

  for (const transformer of opts.transformContent ?? []) {
    transformer({ filePath, frontmatter, content });
  }

  const stuff: MarkdocTreeWalkStuff = {
    baseUrl: app.vite?.config.base ?? '/',
    filePath,
    pagesDir: app.dirs.pages.path,
    highlight: opts.highlight!,
    imports: new Set(),
    links: new Set(),
    headings: [],
  };

  walkRenderTree(content, stuff, (node) => {
    forEachRenderNode(node, stuff);
    for (const transformer of opts.transformTreeNode ?? []) {
      transformer({ node, stuff });
    }
  });

  const { headings } = stuff;
  const title = headings[0]?.level === 1 ? headings[0].title : null;

  const imports = Array.from(
    new Set([...nodeImports, ...Array.from(stuff.imports)]),
  );

  const meta: MarkdownMeta = {
    title,
    headings,
    frontmatter,
    lastUpdated,
  };

  const page = app.pages.getPage(filePath);
  if (page) mergeLayoutMeta(app, page, meta, opts);

  let output =
    (opts.render?.({ filePath, content, meta, imports, stuff }) ??
      renderMarkdocToHTML(content)) ||
    '';

  for (const transformer of opts.transformOutput ?? []) {
    output = transformer({
      filePath,
      meta,
      code: output,
      imports,
      stuff,
    });
  }

  const result: ParseMarkdownResult = {
    meta,
    ast,
    filePath,
    output,
    stuff,
    content,
  };

  cache.set(cacheKey, result);
  cacheK.set(filePath, cacheKey);
  return result;
}

export function getFrontmatter(source: string | Buffer): MarkdownFrontmatter {
  const { data: frontmatter } = matter(source);
  return frontmatter;
}

function mergeLayoutMeta(
  app: App,
  page: ServerPage,
  meta: MarkdownMeta,
  opts: Partial<ParseMarkdownConfig> = {},
) {
  const layoutFiles = page.layouts.map(
    (layout) => app.pages.getLayoutByIndex(layout).filePath,
  );

  for (const layoutFile of layoutFiles.reverse()) {
    if (!opts.filter?.(layoutFile) ?? !layoutFile.endsWith('.md')) continue;

    const { ast: layoutAst, meta: layoutMeta } = parseMarkdown(
      app,
      layoutFile,
      fs.readFileSync(layoutFile, { encoding: 'utf-8' }),
      opts,
    );

    let headingsPos = 0;
    for (const node of layoutAst.walk()) {
      if (node.type === 'heading') {
        headingsPos += 1;
      } else if (node.attributes.content === '<slot />') {
        break;
      }
    }

    meta.title = meta.title ?? layoutMeta.title;
    meta.frontmatter = { ...layoutMeta.frontmatter, ...meta.frontmatter };

    meta.headings = [
      ...(headingsPos > 0
        ? layoutMeta.headings.slice(0, headingsPos)
        : layoutMeta.headings),
      ...meta.headings,
      ...(headingsPos > 0 ? layoutMeta.headings.slice(headingsPos) : []),
    ];

    if (layoutMeta.lastUpdated < meta.lastUpdated) {
      meta.lastUpdated = layoutMeta.lastUpdated;
    }
  }
}

function walkRenderTree(
  node: RenderableTreeNode,
  stuff: MarkdocTreeWalkStuff,
  callback: (node: RenderableTreeNode, stuff: MarkdocTreeWalkStuff) => void,
) {
  callback(node, stuff);

  if (node && typeof node !== 'string' && node.children) {
    for (const child of node.children) {
      walkRenderTree(child, stuff, callback);
    }
  }
}

const codeNameRE = /^(code|Code)$/;
const fenceNameRE = /^(pre|Fence)$/;
const headingNameRE = /^(h\d|Heading)$/;
const linkNameRE = /^(a|link|Link)$/;
const importRE = /^import$/;

export type MarkdocTreeWalkStuff = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [id: string]: any;
  baseUrl: string;
  filePath: string;
  pagesDir: string;
  links: Set<string>;
  imports: Set<string>;
  headings: MarkdownHeading[];
  highlight: HighlightCodeBlock;
};

function forEachRenderNode(
  node: RenderableTreeNode,
  stuff: MarkdocTreeWalkStuff,
) {
  if (node && typeof node !== 'string') {
    const name = node.name;

    if (codeNameRE.test(name)) {
      transformCode(node);
    } else if (fenceNameRE.test(name)) {
      highlightCodeFences(node, stuff.highlight);
    } else if (headingNameRE.test(name)) {
      collectHeadings(node, stuff.headings);
    } else if (linkNameRE.test(name)) {
      resolveLinks(node, stuff);
    } else if (importRE.test(name)) {
      // @ts-expect-error - ignore from render.
      node.name = null;
      const file = node.attributes.file;
      if (file) stuff.imports.add(`import "${file}";`);
    }
  }
}

function transformCode(tag: Tag) {
  const isComponent = tag.name === 'Code';
  const code = isComponent ? tag.attributes.content : tag.children[0];

  if (isComponent && typeof code === 'string') {
    tag.attributes.code = escapeHTML(code);
    tag.children[0] = null;
    delete tag.attributes.content;
  }
}

export type HighlightCodeBlock = (
  code: string,
  lang: string,
) => string | undefined | null;

const preTagRE = /<\/?pre(.*?)>/g;
const preTagStyleAttrRE = /<pre.*?style="(.*?)"/;
function highlightCodeFences(tag: Tag, highlight: HighlightCodeBlock) {
  const isComponent = tag.name === 'Fence';

  const lang = isComponent
    ? tag.attributes.language
    : tag.attributes['data-language'];

  const code = isComponent ? tag.attributes.content : tag.children[0];

  if (typeof code === 'string') {
    const highlightedCode = highlight(code, lang);
    const styles = highlightedCode?.match(preTagStyleAttrRE)?.[1];
    const output = highlightedCode?.replace(preTagRE, '') ?? code;

    if (styles) {
      tag.attributes.style = (tag.attributes.style ?? '') + styles;
    }

    if (isComponent) {
      tag.attributes.lang = lang;
      tag.attributes.code = escapeHTML(code);
      if (highlightedCode) tag.attributes.highlightedCode = output;
      tag.children[0] = null;
      delete tag.attributes.language;
      delete tag.attributes['data-language'];
      delete tag.attributes.content;
    } else {
      tag.attributes.class = `${
        highlightedCode ? 'highlight ' : ''
      }lang-${lang}`;
      tag.children[0] = output;
    }
  }
}

function collectHeadings(tag: Tag, headings: MarkdownHeading[]) {
  const child = tag.children[0];

  const title =
    typeof child === 'string'
      ? child
      : child?.children[0] ?? child?.attributes.content ?? '';

  if (typeof title === 'string') {
    const id = tag.attributes.id ?? slugify(title);

    const level =
      tag.attributes.level ?? Number(tag.name.match(/h(\d+)/)?.[1] ?? 0);

    tag.attributes.id = id;
    tag.attributes.level = level;

    headings.push({
      title,
      id,
      level,
    });
  }
}

function resolveLinks(tag: Tag, stuff: MarkdocTreeWalkStuff) {
  const href = tag.attributes.href;
  if (!href) return;

  const internalLinkMatch = href.match(
    /^((?:.*)(?:\/|\.md|\.html|\.svelte|\.vue|\.jsx|\.tsx))(#.*)?$/,
  );

  if (isLinkExternal(href, stuff.baseUrl)) {
    tag.attributes.target = '_blank';
    tag.attributes.rel = 'noopener noreferrer';
    return;
  }

  if (internalLinkMatch) {
    const rawPath = decodeURI(internalLinkMatch?.[1]);
    const rawHash = internalLinkMatch?.[2] ?? '';

    const absolutePath = rawPath?.startsWith('/')
      ? '.' + rawPath
      : path.resolve(path.dirname(stuff.filePath), rawPath);

    const route = resolveStaticRouteFromFilePath(stuff.pagesDir, absolutePath);

    const resolvedHref = `${route}${rawHash}`;
    tag.attributes.href = resolvedHref;
    stuff.links.add(resolvedHref);
  }
}

// eslint-disable-next-line no-control-regex
const rControl = /[\u0000-\u001f]/g;
const rSpecial = /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g;
const rCombining = /[\u0300-\u036F]/g;
function slugify(str: string) {
  return (
    str
      .normalize('NFKD')
      // Remove accents
      .replace(rCombining, '')
      // Remove control characters
      .replace(rControl, '')
      // Replace special characters
      .replace(rSpecial, '-')
      // Remove continuos separators
      .replace(/-{2,}/g, '-')
      // Remove prefixing and trailing separators
      .replace(/^-+|-+$/g, '')
      // Ensure it doesn't start with a number (#121)
      .replace(/^(\d)/, '_$1')
      // Lowercase
      .toLowerCase()
  );
}
