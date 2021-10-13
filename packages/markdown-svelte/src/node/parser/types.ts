import type { MarkdownParserEnv as DefaultMarkdownParserEnv } from '@vitebook/markdown/node';

export type SvelteMarkdownParserEnv = DefaultMarkdownParserEnv & {
  hoistedTags?: string[];
};
