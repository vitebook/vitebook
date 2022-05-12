import fs from 'fs-extra';
import matter from 'gray-matter';
import LRUCache from 'lru-cache';
import toml from 'toml';

import type { App } from '../App';
import { preventViteConstantsReplacement } from './md-utils';
import type {
  MarkdownParser,
  MarkdownParserEnv,
  ParsedMarkdownResult,
  ParseMarkdownOptions,
} from './types';

const cache = new LRUCache<string, ParsedMarkdownResult>({ max: 1024 });

export function parseMarkdown(
  app: App,
  parser: MarkdownParser,
  source: string,
  filePath: string,
  options: ParseMarkdownOptions = {},
): ParsedMarkdownResult {
  const cacheKey = source;

  if (cache.has(cacheKey)) return cache.get(source)!;

  const {
    data: frontmatter,
    content,
    excerpt,
  } = matter(source, {
    excerpt_separator: '<!-- more -->',
    engines: {
      toml: toml.parse.bind(toml),
    },
  });

  const parserEnv: MarkdownParserEnv = {
    app,
    filePath,
    frontmatter,
  };

  let html = parser.render(content, parserEnv);

  const excerptHtml = parser.render(excerpt ?? '');

  if (options.escapeConstants) {
    html = preventViteConstantsReplacement(html, options.define);
  }

  const {
    headers = [],
    importedFiles = [],
    links = [],
    title = '',
  } = parserEnv;

  const result: ParsedMarkdownResult = {
    source: content,
    html,
    links,
    importedFiles,
    env: parserEnv,
    meta: {
      file: filePath,
      excerpt: excerptHtml,
      headers,
      title,
      frontmatter,
      lastUpdated: Math.round(fs.statSync(filePath).mtimeMs),
    },
  };

  cache.set(cacheKey, result);
  return result;
}
