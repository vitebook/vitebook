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
import { resolveRoute } from '../pages';
import { render } from './render';

export type ParsedMarkdownResult = MarkdownMeta & {
  filePath: string;
  output: string;
};

export type ParseMarkdownConfig = {
  ignoreCache?: boolean;

  pagesDir: string;
  highlight: HighlightCodeBlock;

  transformAst?: ((data: {
    filePath: string;
    ast: Node;
    source: string;
  }) => void)[];

  transformContent?: ((data: {
    filePath: string;
    content: RenderableTreeNode;
    frontmatter: MarkdownFrontmatter;
  }) => string)[];

  transformOutput?: ((data: {
    filePath: string;
    code: string;
    frontmatter: MarkdownFrontmatter;
    script: string[];
    scriptModule: string[];
  }) =>
    | string
    | { code?: string; script?: string[]; scriptModule?: string[] })[];
};

const cache = new LRUCache<string, ParsedMarkdownResult>({ max: 1024 });
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
    transformAst = [],
    transformContent = [],
    transformOutput = [],
  }: ParseMarkdownConfig,
): ParsedMarkdownResult {
  const cacheKey = source;

  if (!ignoreCache && cache.has(cacheKey)) return cache.get(source)!;

  const ast = Markdoc.parse(source, filePath);

  for (const transformer of transformAst) {
    transformer({ filePath, ast, source });
  }

  const frontmatter: MarkdownFrontmatter = ast.attributes.frontmatter
    ? yaml.load(ast.attributes.frontmatter)
    : {};

  const imports = app.markdoc.resolveImports(filePath);
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

  const stuff: TreeWalkStuff = {
    filePath,
    pagesDir,
    highlight,
    imports: new Set(),
    links: new Set(),
    headings: [],
  };

  walkRenderTree(content, stuff, forEachRenderNode);

  const { headings } = stuff;
  const title = headings[0]?.level === 1 ? headings[0].title : null;

  let output =
    (stuff.head ? `<svelte:head>${stuff.head}</svelte:head>\n\n` : '') +
    (render(content) || '');

  const script: string[] = Array.from(
    new Set([...imports, ...Array.from(stuff.imports)]),
  );

  const scriptModule: string[] = [];

  const meta: MarkdownMeta = {
    title,
    headings,
    frontmatter,
    lastUpdated,
  };

  scriptModule.push(`export const meta = ${JSON.stringify(meta)};`);

  for (const transformer of transformOutput) {
    const result = transformer({
      filePath,
      frontmatter,
      code: output,
      script,
      scriptModule,
    });

    if (typeof result === 'string') {
      output = result;
    } else {
      if (result.code) output = result.code;
      if (result.script) script.push(...result.script);
      if (result.scriptModule) scriptModule.push(...result.scriptModule);
    }
  }

  const moduleCode = `<script context="module">\n  ${scriptModule.join(
    '\n  ',
  )}\n</script>\n\n`;

  const scriptCode = `<script>\n  ${script.join('\n  ')}\n</script>\n\n`;

  output = `${moduleCode}${scriptCode}${output}`;

  const result: ParsedMarkdownResult = {
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
  stuff: TreeWalkStuff,
  callback: (node: RenderableTreeNode, stuff: TreeWalkStuff) => void,
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
const svelteHeadNameRE = /^svelte:head$/;
const componentNameRE = /^component$/;

type TreeWalkStuff = {
  head?: string;
  filePath: string;
  pagesDir: string;
  links: Set<string>;
  imports: Set<string>;
  headings: MarkdownHeading[];
  highlight: HighlightCodeBlock;
};

function forEachRenderNode(node: RenderableTreeNode, stuff: TreeWalkStuff) {
  if (node && typeof node !== 'string') {
    const name = node.name;

    if (codeNameRE.test(name)) {
      escapeCodeContent(node, name === 'Code');
    } else if (fenceNameRE.test(name)) {
      highlightCodeFences(node, stuff.highlight, name === 'Fence');
    } else if (headingNameRE.test(name)) {
      collectHeadings(node, stuff.headings);
    } else if (linkNameRE.test(name)) {
      resolveLinks(node, stuff);
    } else if (svelteHeadNameRE.test(name)) {
      resolveSvelteHead(node, stuff);
    } else if (componentNameRE.test(name)) {
      resolveComponent(node, stuff);
    }
  }
}

function resolveSvelteHead(tag: Tag, stuff: TreeWalkStuff) {
  tag.attributes.__ignore = true;
  if (typeof tag.children[0] === 'object') {
    if (Array.isArray(tag.children[0]?.children)) {
      stuff.head = tag.children[0]!.children.join('');
    }
  }
}

function resolveComponent(tag: Tag, stuff: TreeWalkStuff) {
  const { name, path: filePath } = tag.attributes;

  tag.name = name;

  stuff.imports.add(`import ${name} from "${filePath}";`);

  delete tag.attributes.name;
  delete tag.attributes.path;
}

function escapeCodeContent(tag: Tag, isComponent = false) {
  const code = isComponent ? tag.attributes.content : tag.children[0];

  if (typeof code === 'string') {
    if (isComponent) {
      tag.attributes.code = { __render: () => `code={"${escapeHtml(code)}"}` };
      tag.children[0] = null;
      delete tag.attributes.content;
    } else {
      tag.children[0] = htmlBlock(escapeHtml(code));
    }
  }
}

export type HighlightCodeBlock = (
  code: string,
  lang: string,
) => string | undefined | null;

const preTagRE = /<\/?pre(.*?)>/g;
const preTagStyleAttrRE = /<pre.*?style="(.*?)"/;
function highlightCodeFences(
  tag: Tag,
  highlight: HighlightCodeBlock,
  isComponent = false,
) {
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
      tag.attributes.code = {
        __render: () => `code={${JSON.stringify(escapeHtml(code))}}`,
      };

      if (highlightedCode) {
        tag.attributes.higlightedCode = {
          __render: () => `highlightedCode={${JSON.stringify(output)}}`,
        };
      }

      tag.children[0] = null;
      delete tag.attributes['data-language'];
      delete tag.attributes.content;
    } else {
      tag.attributes.class = `highlight lang-${lang}`;
      tag.children[0] = htmlBlock(output);
    }
  }
}

function htmlBlock(text: string) {
  return `{@html ${JSON.stringify(text)}}`;
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

function resolveLinks(tag: Tag, stuff: TreeWalkStuff) {
  const href = tag.attributes.href;
  if (!href) return;

  const internalLinkMatch = href.match(
    /^((?:.*)(?:\/|\.md|\.html|\.svelte))(#.*)?$/,
  );

  if (isLinkExternal(href)) {
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

    const route = resolveRoute(stuff.pagesDir, absolutePath);

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
