import { prettyJsonStr } from '@vitebook/core/utils/json.js';
import {
  MarkdownData,
  MarkdownParser,
  parseMarkdown as parseMarkdownDefault,
  ParseMarkdownOptions
} from '@vitebook/plugin-markdown';
import LRUCache from 'lru-cache';

import type { MarkdownVueParserEnv } from './types.js';

export type ParseMarkdownToVueOptions = ParseMarkdownOptions;

export type ParsedMarkdownToVueResult = {
  component: string;
  data: MarkdownData;
};

const cache = new LRUCache<string, ParsedMarkdownToVueResult>({ max: 1024 });

export function parseMarkdownToVue(
  parser: MarkdownParser,
  source: string,
  filePath: string,
  options: ParseMarkdownToVueOptions = {}
): ParsedMarkdownToVueResult {
  const cachedResult = cache.get(source);
  if (cachedResult) return cachedResult;

  const {
    html,
    data,
    env: parserEnv
  } = parseMarkdownDefault(parser, source, filePath, {
    ...options
  });

  const { hoistedTags } = parserEnv as MarkdownVueParserEnv;

  const component =
    buildDataExport(hoistedTags ?? [], data).join('\n') +
    `\n\n<template><div>${html}</div></template>`;

  const result: ParsedMarkdownToVueResult = {
    component,
    data
  };

  cache.set(source, result);
  return result;
}

const scriptRE = /<\/script>/;
const scriptSetupRE = /<\s*script[^>]*\bsetup\b[^>]*/;
const defaultExportRE = /((?:^|\n|;)\s*)export(\s*)default/;
const namedDefaultExportRE = /((?:^|\n|;)\s*)export(.+)as(\s*)default/;

function buildDataExport(tags: string[], data: MarkdownData): string[] {
  const code = `\nexport const data = ${prettyJsonStr(data)}`;

  const existingScriptIndex = tags.findIndex((tag) => {
    return scriptRE.test(tag) && !scriptSetupRE.test(tag);
  });

  if (existingScriptIndex > -1) {
    const tagSrc = tags[existingScriptIndex];
    // User has `<script>` tag inside markdown.
    // If it doesn't have `export default` it will error out on build.
    const hasDefaultExport =
      defaultExportRE.test(tagSrc) || namedDefaultExportRE.test(tagSrc);

    tags[existingScriptIndex] = tagSrc.replace(
      scriptRE,
      code + (hasDefaultExport ? `` : `\nexport default{}\n`) + `</script>`
    );
  } else {
    tags.unshift(`<script>${code}\nexport default {}</script>`);
  }

  return tags;
}
