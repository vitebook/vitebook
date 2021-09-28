import type { App } from '@vitebook/core/node';
import { fs } from '@vitebook/core/node/utils';
import {
  HeadConfig,
  LocaleConfig,
  omitPageMeta,
  prettyJsonStr
} from '@vitebook/core/shared';
import matter from 'gray-matter';
import LRUCache from 'lru-cache';
import toml from 'toml';

import type { MarkdownPageModule } from '../../shared/index';
import type {
  MarkdownParser,
  MarkdownParserEnv,
  ParsedMarkdownResult,
  ParseMarkdownOptions
} from './types';
import { preventViteConstantsReplacement } from './utils';

const cache = new LRUCache<string, ParsedMarkdownResult>({ max: 1024 });

export function parseMarkdown(
  app: App,
  parser: MarkdownParser,
  source: string,
  filePath: string,
  options: ParseMarkdownOptions = {}
): ParsedMarkdownResult {
  const cachedResult = cache.get(source);
  if (cachedResult) return cachedResult;

  const {
    data: frontmatter,
    content,
    excerpt
  } = matter(source, {
    excerpt_separator: '<!-- more -->',
    engines: {
      toml: toml.parse.bind(toml)
    }
  });

  const parserEnv: MarkdownParserEnv = {
    app,
    filePath,
    frontmatter
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
    title = ''
  } = parserEnv;

  const result: ParsedMarkdownResult = {
    content,
    html,
    links,
    importedFiles,
    env: parserEnv,
    meta: {
      excerpt: excerptHtml,
      headers,
      title,
      head: frontmatter.head as HeadConfig[],
      description: frontmatter.description as string,
      locales: frontmatter.locales as LocaleConfig,
      frontmatter: omitPageMeta(frontmatter),
      lastUpdated: Math.round(fs.statSync(filePath).mtimeMs)
    }
  };

  cache.set(source, result);
  return result;
}

export function loadParsedMarkdown(result: ParsedMarkdownResult): string {
  const mod: MarkdownPageModule = {
    default: result.html,
    __pageMeta: result.meta
  };

  return `
export const __pageMeta = ${prettyJsonStr(mod.__pageMeta)};
export default ${mod.default};
  `;
}
