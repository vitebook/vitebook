import LRUCache from 'lru-cache';

import { prettyJsonStr } from '../../../shared';
import type { App } from '../App';
import {
  commentOutSvelteTemplateTags,
  dedupeHoistedTags,
  uncommentSvelteTemplateTags,
} from './md-utils';
import { parseMarkdown } from './parseMarkdown';
import type {
  ComponentTopLevelTag,
  MarkdownParser,
  MarkdownParserEnv,
  ParsedMarkdownResult,
  ParseMarkdownOptions,
} from './types';

export type ParseMarkdownToSvelteOptions = ParseMarkdownOptions & {
  topLevelTags?: ComponentTopLevelTag[];
};

export type ParseMarkdownToSvelteResult = ParsedMarkdownResult & {
  component: string;
};

const cache = new LRUCache<string, ParseMarkdownToSvelteResult>({
  max: 1024,
});

export function parseMarkdownToSvelte(
  app: App,
  parser: MarkdownParser,
  source: string,
  filePath: string,
  options: ParseMarkdownToSvelteOptions = {},
): ParseMarkdownToSvelteResult {
  const cacheKey = source;

  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  const { topLevelTags = [], ...parseMarkdownOptions } = options;

  const md = parseMarkdown(
    app,
    parser,
    commentOutSvelteTemplateTags(source),
    filePath,
    parseMarkdownOptions,
  );

  const { hoistedTags = [] } = md.env as MarkdownParserEnv;

  topLevelTags.push({
    scope: 'module',
    content: `export const meta = ${prettyJsonStr(md.meta)};`,
  });

  topLevelTags.push({
    scope: 'script',
    content: [
      `import { frontmatter as __frontmatter } from '@vitebook/core';`,
      `$: frontmatter = $__frontmatter;`,
    ].join('\n'),
  });

  for (const { scope, content } of topLevelTags) {
    hoistedTags.push(
      [
        scope === 'module' ? `<script context="module">` : `<script>`,
        content,
        `</script>`,
      ].join('\n'),
    );
  }

  const component =
    dedupeHoistedTags(hoistedTags).join('\n') +
    `\n\n${uncommentSvelteTemplateTags(md.html)}`;

  const result: ParseMarkdownToSvelteResult = {
    ...md,
    component,
  };

  cache.set(cacheKey, result);
  return result;
}
