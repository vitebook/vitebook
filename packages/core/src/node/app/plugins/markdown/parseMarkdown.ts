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
  escapeHtml,
  isLinkExternal,
  type MarkdownFrontmatter,
  type MarkdownHeading,
  type MarkdownMeta,
} from '../../../../shared';
import type { App } from '../../App';
import { resolvePageRouteFromFilePath } from '../pages';
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
  pagesDir: string;
  highlight: HighlightCodeBlock;
  transformAst: MarkdocAstTransformer[];
  transformTreeNode: MarkdocTreeNodeTransformer[];
  transformContent: MarkdocContentTransformer[];
  transformOutput: MarkdocOutputTransformer[];
  render: MarkdocRenderer;
};

export type ParseMarkdownResult = MarkdownMeta & {
  filePath: string;
  output: string;
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
  {
    ignoreCache = false,
    pagesDir,
    highlight,
    transformTreeNode: transformRenderNode = [],
    transformAst = [],
    transformContent = [],
    transformOutput = [],
    render,
  }: Partial<ParseMarkdownConfig>,
): ParseMarkdownResult {
  const cacheKey = source;

  if (!ignoreCache && cache.has(cacheKey)) return cache.get(source)!;

  const ast = Markdoc.parse(source, filePath);

  for (const transformer of transformAst) {
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

  for (const transformer of transformContent) {
    transformer({ filePath, frontmatter, content });
  }

  const stuff: MarkdocTreeWalkStuff = {
    baseUrl: app.vite?.config.base ?? '/',
    filePath,
    pagesDir: pagesDir!,
    highlight: highlight!,
    imports: new Set(),
    links: new Set(),
    headings: [],
  };

  walkRenderTree(content, stuff, (node) => {
    forEachRenderNode(node, stuff);
    for (const transformer of transformRenderNode) {
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

  let output =
    (render?.({ filePath, content, meta, imports, stuff }) ??
      renderMarkdocToHTML(content)) ||
    '';

  for (const transformer of transformOutput) {
    output = transformer({
      filePath,
      meta,
      code: output,
      imports,
      stuff,
    });
  }

  const result: ParseMarkdownResult = {
    ...meta,
    filePath,
    output,
  };

  cache.set(cacheKey, result);
  cacheK.set(filePath, cacheKey);
  return result;
}

export function getFrontmatter(source: string | Buffer): MarkdownFrontmatter {
  const { data: frontmatter } = matter(source);
  return frontmatter;
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
const componentNameRE = /^component$/;

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
    } else if (componentNameRE.test(name)) {
      resolveComponent(node, stuff);
    }
  }
}

function resolveComponent(tag: Tag, stuff: MarkdocTreeWalkStuff) {
  const { name, path: filePath } = tag.attributes;

  tag.name = name;

  stuff.imports.add(`import ${name} from "${filePath}";`);

  delete tag.attributes.name;
  delete tag.attributes.path;
}

function transformCode(tag: Tag) {
  const isComponent = tag.name === 'Code';
  const code = isComponent ? tag.attributes.content : tag.children[0];

  if (isComponent && typeof code === 'string') {
    tag.attributes.code = escapeHtml(code);
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
      tag.attributes.code = escapeHtml(code);
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
  const title = tag.children[0];

  if (typeof title === 'string') {
    const id = tag.attributes.id ?? slugify(title);
    tag.attributes.id = id;

    headings.push({
      title,
      id,
      level: tag.attributes.level,
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

    const route = resolvePageRouteFromFilePath(
      stuff.pagesDir,
      absolutePath,
    ).pathname;

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
