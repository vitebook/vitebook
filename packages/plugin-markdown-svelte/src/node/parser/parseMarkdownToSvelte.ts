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
    buildMetaExport(mergeDuplicateHoistedTags(hoistedTags), meta).join('\n') +
    `\n\n${escapeCharsInPre(uncommentTemplateTags(html))}`;

  const result: ParsedMarkdownToVueResult = {
    component,
    meta
  };

  cache.set(source, result);
  return result;
}

const OPENING_SCRIPT_TAG_RE = /<\s*script[^>]*>/;
const OPENING_STYLE_TAG_RE = /<\s*style[^>]*>/;
const CLOSING_STYLE_TAG_RE = /<\/style>/;
const CLOSING_SCRIPT_TAG_RE = /<\/script>/;
const OPENING_SCRIPT_MODULE_TAG_RE =
  /<\s*script[^>]*\scontext="module"\s*[^>]*>/;
const IMPORT_GLOBALS_CODE = `\nimport { RouterLink, OutboundLink } from '@vitebook/plugin-markdown-svelte/client';\n`;

function buildMetaExport(tags: string[], meta: MarkdownPageMeta): string[] {
  const code = `\nexport const __pageMeta = ${prettyJsonStr(meta)};\n`;

  const scriptModuleIndex = tags.findIndex((tag) =>
    OPENING_SCRIPT_MODULE_TAG_RE.test(tag)
  );

  if (scriptModuleIndex > -1) {
    const tagSrc = tags[scriptModuleIndex];
    tags[scriptModuleIndex] = tagSrc.replace(
      CLOSING_SCRIPT_TAG_RE,
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

function mergeDuplicateHoistedTags(tags: string[] = []): string[] {
  const deduped = new Map();

  const merge = (
    key: string,
    tag: string,
    openingTagRe: RegExp,
    closingTagRE: RegExp
  ) => {
    if (!deduped.has(key)) {
      deduped.set(key, tag);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const block = deduped.get(key)!;
    deduped.set(
      key,
      block.replace(closingTagRE, tag.replace(openingTagRe, ''))
    );
  };

  tags.forEach((tag) => {
    if (OPENING_SCRIPT_MODULE_TAG_RE.test(tag)) {
      merge('module', tag, OPENING_SCRIPT_MODULE_TAG_RE, CLOSING_SCRIPT_TAG_RE);
    } else if (OPENING_SCRIPT_TAG_RE.test(tag)) {
      merge('script', tag, OPENING_SCRIPT_TAG_RE, CLOSING_SCRIPT_TAG_RE);
    } else if (OPENING_STYLE_TAG_RE.test(tag)) {
      merge('style', tag, OPENING_STYLE_TAG_RE, CLOSING_STYLE_TAG_RE);
    } else {
      // Treat unknowns as unique and leave them as-is.
      deduped.set(Symbol(), tag);
    }
  });

  return Array.from(deduped.values());
}
