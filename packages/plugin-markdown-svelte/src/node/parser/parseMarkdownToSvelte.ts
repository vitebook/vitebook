import type { App } from '@vitebook/core/node';
import { prettyJsonStr } from '@vitebook/core/shared';
import {
  MarkdownParser,
  parseMarkdown as parseMarkdownDefault,
  ParseMarkdownOptions
} from '@vitebook/plugin-markdown/node';
import type { MarkdownPageMeta } from '@vitebook/plugin-markdown/shared';
import LRUCache from 'lru-cache';

import type { SvelteMarkdownParserEnv } from './types';

export type ParseMarkdownToVueOptions = ParseMarkdownOptions;

export type ParsedMarkdownToVueResult = {
  component: string;
  meta: MarkdownPageMeta;
};

const cache = new LRUCache<string, ParsedMarkdownToVueResult>({ max: 1024 });

export function parseMarkdownToSvelte(
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
  } = parseMarkdownDefault(
    app,
    parser,
    commentOutTemplateTags(source),
    filePath,
    {
      ...options
    }
  );

  const { hoistedTags } = parserEnv as SvelteMarkdownParserEnv;

  const component =
    buildMetaExport(hoistedTags ?? [], meta).join('\n') +
    `\n\n${escapeCharsInPre(uncommentTemplateTags(html))}`;

  const result: ParsedMarkdownToVueResult = {
    component,
    meta
  };

  cache.set(source, result);
  return result;
}

const CLOSING_SCRIPT_RE = /<\/script>/;
const SCRIPT_MODULE_RE = /<\s*script[^>]*\scontext="module"\s*[^>]*/;
const IMPORT_GLOBALS_CODE = `\nimport { RouterLink, OutboundLink } from '@vitebook/plugin-markdown-svelte/client';\n`;

function buildMetaExport(tags: string[], meta: MarkdownPageMeta): string[] {
  const code = `\nexport const __pageMeta = ${prettyJsonStr(meta)};\n`;

  const scriptModuleIndex = tags.findIndex((tag) => SCRIPT_MODULE_RE.test(tag));

  if (scriptModuleIndex > -1) {
    const tagSrc = tags[scriptModuleIndex];
    tags[scriptModuleIndex] = tagSrc.replace(
      CLOSING_SCRIPT_RE,
      IMPORT_GLOBALS_CODE + code + `</script>`
    );
  } else {
    tags.unshift(
      `<script context="module">${IMPORT_GLOBALS_CODE}${code}</script>`
    );
  }

  return tags;
}

const TEMPLATE_TAG_RE =
  /(\{#(if|each|await|key).*\})|(\{:(else|then|catch).*\})|(\{\/(if|each|key|await)\})|(\{@(html|debug).*\})/gim;

function commentOutTemplateTags(source: string) {
  return source.replace(TEMPLATE_TAG_RE, (match) => {
    return `<!--&%& ${match} &%&-->`;
  });
}

const TEMPLATE_TAG_COMMENT_RE = /(<!--&%&\s)|(\s&%&-->)/gim;

function uncommentTemplateTags(source: string) {
  return source.replace(TEMPLATE_TAG_COMMENT_RE, '');
}

const PRE_RE = />(\{|\}|\s+)<\/span/gim;
const PRE_SPACES_RE = />\s+<\/span/;

function escapeCharsInPre(source: string) {
  return source.replace(PRE_RE, (match) => {
    if (PRE_SPACES_RE.test(match)) {
      return `>${'&nbsp;'.repeat(match.length - 7)}</span`;
    }

    return `>${match === '>{</span' ? '&#123;' : '&#125;'}</span`;
  });
}
