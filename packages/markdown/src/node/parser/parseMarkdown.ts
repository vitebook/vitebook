import type { App } from '@vitebook/core/node';
import { HeadConfig, LocaleConfig, prettyJsonStr } from '@vitebook/core/node';
import { fs } from '@vitebook/core/node/utils';
import matter from 'gray-matter';
import LRUCache from 'lru-cache';
import toml from 'toml';

import type {
  MarkdownParser,
  MarkdownParserEnv,
  ParsedMarkdownResult,
  ParseMarkdownOptions,
} from './types';
import { preventViteConstantsReplacement } from './utils';

const cache = new LRUCache<string, ParsedMarkdownResult>({ max: 1024 });

export function parseMarkdown(
  app: App,
  parser: MarkdownParser,
  source: string,
  filePath: string,
  options: ParseMarkdownOptions = {},
): ParsedMarkdownResult {
  const cachedResult = cache.get(source);
  if (cachedResult) return cachedResult;

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
      frontmatter,
      lastUpdated: Math.round(fs.statSync(filePath).mtimeMs),
    },
  };

  cache.set(source, result);
  return result;
}

export function loadParsedMarkdown(result: ParsedMarkdownResult): string {
  return `
<script context="module">
export const __pageMeta = ${prettyJsonStr(result.meta)};
</script>

${result.html}
  `;
}
