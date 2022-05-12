/* eslint-disable import/no-named-as-default-member */

import Markdoc, { type Config } from '@markdoc/markdoc';
import matter from 'gray-matter';
import LRUCache from 'lru-cache';

import { type MarkdownFrontmatter } from '../../../../shared';

export type ParsedMarkdownResult = {
  output: string;
};

export type ParseMarkdownOptions = {
  ignoreCache?: boolean;
};

const cache = new LRUCache<string, ParsedMarkdownResult>({ max: 1024 });

export function parseMarkdown(
  filePath: string,
  source: string,
  { ignoreCache = false }: ParseMarkdownOptions = {},
): ParsedMarkdownResult {
  const cacheKey = source;

  if (!ignoreCache && cache.has(cacheKey)) return cache.get(source)!;

  const config: Config = {
    nodes: {
      // ...
    },
    tags: {
      // ...
    },
    variables: {
      // ...
      // vite stuff
      // frontmatter
    },
    functions: {
      //
    },
    partials: {
      // 'header.md': Markdoc.parse(`# My header`),
    },
  };

  const ast = Markdoc.parse(source);
  const content = Markdoc.transform(ast, config);
  const output = Markdoc.renderers.html(content) || '';
  // const lastUpdated = Math.round(fs.statSync(filePath).mtimeMs);

  const result: ParsedMarkdownResult = {
    output,
  };

  cache.set(cacheKey, result);
  return result;
}

export function getFrontmatter(source: string | Buffer): MarkdownFrontmatter {
  const { data: frontmatter } = matter(source);
  return frontmatter;
}
