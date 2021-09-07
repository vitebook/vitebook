import { prettyJsonStr } from '@vitebook/core/utils/json.js';
import matter from 'gray-matter';
import LRUCache from 'lru-cache';
import toml from 'toml';

import type { MarkdownPageModule } from '../page.js';
import type {
  MarkdownParser,
  MarkdownParserEnv,
  ParsedMarkdownResult,
  ParseMarkdownOptions
} from './types.js';
import { preventViteConstantsReplacement } from './utils.js';

const cache = new LRUCache<string, ParsedMarkdownResult>({ max: 1024 });

export function parseMarkdown(
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
    data: {
      excerpt: excerptHtml,
      frontmatter,
      headers,
      title
    }
  };

  cache.set(source, result);
  return result;
}

export function loadParsedMarkdown(result: ParsedMarkdownResult): string {
  const mod: MarkdownPageModule = {
    default: result.html,
    data: result.data
  };

  return `
export const data = ${prettyJsonStr(mod.data)};

export default ${mod.default};
  `;
}
