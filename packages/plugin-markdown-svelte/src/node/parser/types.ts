import type { MarkdownParserEnv as DefaultMarkdownParserEnv } from '@vitebook/plugin-markdown/node';

export type SvelteMarkdownParserEnv = DefaultMarkdownParserEnv & {
  hoistedTags?: string[];
};
