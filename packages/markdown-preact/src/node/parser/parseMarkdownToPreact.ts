import type { App } from '@vitebook/core/node';
import { prettyJsonStr } from '@vitebook/core/node';
import { path } from '@vitebook/core/node/utils';
import type { MarkdownPageMeta } from '@vitebook/markdown/node';
import {
  MarkdownParser,
  parseMarkdown,
  ParseMarkdownOptions,
} from '@vitebook/markdown/node';
import { transformSync } from 'esbuild';
import LRUCache from 'lru-cache';

import type { PreactMarkdownParserEnv } from './types';

export type ParseMarkdownToPreactOptions = ParseMarkdownOptions;

export type ParsedMarkdownToPreactResult = {
  component: string;
  meta: MarkdownPageMeta;
};

const cache = new LRUCache<string, ParsedMarkdownToPreactResult>({ max: 1024 });

const OPENING_SCRIPT_TAG_RE = /<\s*script[^>]*>/;
const CLOSING_SCRIPT_TAG_RE = /<\/script>/;
const OPENING_SCRIPT_MODULE_TAG_RE =
  /<\s*script[^>]*\scontext="module"\s*[^>]*>/;

const SCRIPT_TAG_CONTENT_RE = /<\s*script[^>]*>([\s\S]*)<\/script>/;

// const SCRIPT_MODULE_TAG_CONTENT_RE =
//   /<\s*script[^>]*\scontext="module"\s*[^>]*>([\s\S]*)<\/script>/;

export function parseMarkdownToPreact(
  app: App,
  parser: MarkdownParser,
  source: string,
  filePath: string,
  options: ParseMarkdownToPreactOptions = {},
): ParsedMarkdownToPreactResult {
  const cachedResult = cache.get(source);
  if (cachedResult) return cachedResult;

  const {
    html,
    meta,
    env: parserEnv,
  } = parseMarkdown(app, parser, source, filePath, {
    ...options,
  });

  const { hoistedTags } = parserEnv as PreactMarkdownParserEnv;

  const component = buildPreactComponentModule(
    path.basename(filePath),
    dedupeHoistedTags(hoistedTags),
    html,
    meta,
  );

  const result: ParsedMarkdownToPreactResult = {
    component,
    meta,
  };

  cache.set(source, result);
  return result;
}

function buildPreactComponentModule(
  displayName: string,
  tags: string[],
  html: string,
  meta: MarkdownPageMeta,
): string {
  const moduleCode = tags
    .find((tag) => OPENING_SCRIPT_MODULE_TAG_RE.test(tag))
    ?.replace(OPENING_SCRIPT_MODULE_TAG_RE, '')
    ?.replace(CLOSING_SCRIPT_TAG_RE, '');

  const fnCode = tags
    .find(
      (tag) =>
        !OPENING_SCRIPT_MODULE_TAG_RE.test(tag) &&
        OPENING_SCRIPT_TAG_RE.test(tag),
    )
    ?.replace(OPENING_SCRIPT_TAG_RE, '')
    ?.replace(CLOSING_SCRIPT_TAG_RE, '');

  const jsxCode = html
    .replace(new RegExp(SCRIPT_TAG_CONTENT_RE, 'g'), '')
    .replace(/<br(.*?)(\/)?>/g, (_, m) => `<br${m}/>`);

  const jsx = `
import { h } from 'preact';
import { OutboundLink } from '@vitebook/preact';
${moduleCode ? `\n${moduleCode}\n` : ''}
function Markdown() {
  ${fnCode ? `${fnCode}\n` : ''}
  return (
    <div>${jsxCode}</div>
  )
}

Markdown.displayName = '${displayName}';

export const __pageMeta = ${prettyJsonStr(meta)};

export default Markdown;
  `;

  return transformSync(jsx, {
    target: 'esnext',
    loader: 'tsx',
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  }).code;
}

function dedupeHoistedTags(tags: string[] = []): string[] {
  const deduped = new Map();

  const merge = (
    key: string,
    tag: string,
    openingTagRe: RegExp,
    closingTagRE: RegExp,
  ) => {
    if (!deduped.has(key)) {
      deduped.set(key, tag);
      return;
    }

    const block = deduped.get(key)!;
    deduped.set(
      key,
      block.replace(closingTagRE, tag.replace(openingTagRe, '')),
    );
  };

  tags.forEach((tag) => {
    if (OPENING_SCRIPT_MODULE_TAG_RE.test(tag)) {
      merge('module', tag, OPENING_SCRIPT_MODULE_TAG_RE, CLOSING_SCRIPT_TAG_RE);
    } else if (OPENING_SCRIPT_TAG_RE.test(tag)) {
      merge('script', tag, OPENING_SCRIPT_TAG_RE, CLOSING_SCRIPT_TAG_RE);
    } else {
      // Treat unknowns as unique and leave them as-is.
      deduped.set(Symbol(), tag);
    }
  });

  return Array.from(deduped.values());
}
