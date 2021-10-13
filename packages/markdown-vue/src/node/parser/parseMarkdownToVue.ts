import type { App } from '@vitebook/core/node';
import { prettyJsonStr } from '@vitebook/core/node';
import type { MarkdownPageMeta } from '@vitebook/markdown';
import {
  MarkdownParser,
  parseMarkdown,
  ParseMarkdownOptions
} from '@vitebook/markdown/node';
import LRUCache from 'lru-cache';

import type { VueMarkdownParserEnv } from './types';

export type ParseMarkdownToVueOptions = ParseMarkdownOptions;

export type ParsedMarkdownToVueResult = {
  component: string;
  meta: MarkdownPageMeta;
};

const cache = new LRUCache<string, ParsedMarkdownToVueResult>({ max: 1024 });

export function parseMarkdownToVue(
  app: App,
  parser: MarkdownParser,
  source: string,
  filePath: string,
  options: ParseMarkdownToVueOptions = {}
): ParsedMarkdownToVueResult {
  const cachedResult = cache.get(source);
  if (cachedResult) return cachedResult;

  const {
    html,
    meta,
    env: parserEnv
  } = parseMarkdown(app, parser, source, filePath, {
    ...options
  });

  const { hoistedTags } = parserEnv as VueMarkdownParserEnv;

  const component =
    buildMetaExport(hoistedTags ?? [], meta).join('\n') +
    `\n\n<template><div>${html}</div></template>`;

  const result: ParsedMarkdownToVueResult = {
    component,
    meta
  };

  cache.set(source, result);
  return result;
}

const CLOSING_SCRIPT_TAG_RE = /<\/script>/;
const SCRIPT_SETUP_TAG_RE = /<\s*script[^>]*\bsetup\b[^>]*/;
const DEFAULT_EXPORT_RE = /((?:^|\n|;)\s*)export(\s*)default/;
const NAMED_DEFAULT_EXPORT_RE = /((?:^|\n|;)\s*)export(.+)as(\s*)default/;

function buildMetaExport(tags: string[], meta: MarkdownPageMeta): string[] {
  const code = `\nexport const __pageMeta = ${prettyJsonStr(meta)};\n`;

  const existingScriptIndex = tags.findIndex((tag) => {
    return CLOSING_SCRIPT_TAG_RE.test(tag) && !SCRIPT_SETUP_TAG_RE.test(tag);
  });

  if (existingScriptIndex > -1) {
    const tagSrc = tags[existingScriptIndex];
    // User has `<script>` tag inside markdown.
    // If it doesn't have `export default` it will error out on build.
    const hasDefaultExport =
      DEFAULT_EXPORT_RE.test(tagSrc) || NAMED_DEFAULT_EXPORT_RE.test(tagSrc);

    tags[existingScriptIndex] = tagSrc.replace(
      CLOSING_SCRIPT_TAG_RE,
      code + (hasDefaultExport ? `` : `\nexport default{}\n`) + `</script>`
    );
  } else {
    tags.unshift(`<script>${code}\nexport default {}</script>`);
  }

  return tags;
}
