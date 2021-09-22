import type { App } from '@vitebook/core/node';
import { prettyJsonStr } from '@vitebook/core/shared';
import {
  MarkdownParser,
  parseMarkdown as parseMarkdownDefault,
  ParseMarkdownOptions
} from '@vitebook/plugin-markdown/node';
import type { MarkdownPageMeta } from '@vitebook/plugin-markdown/shared';
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
  } = parseMarkdownDefault(app, parser, source, filePath, {
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

const scriptRE = /<\/script>/;
const scriptSetupRE = /<\s*script[^>]*\bsetup\b[^>]*/;
const defaultExportRE = /((?:^|\n|;)\s*)export(\s*)default/;
const namedDefaultExportRE = /((?:^|\n|;)\s*)export(.+)as(\s*)default/;

function buildMetaExport(tags: string[], meta: MarkdownPageMeta): string[] {
  const code = `\nexport const __pageMeta = ${prettyJsonStr(meta)}`;

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
