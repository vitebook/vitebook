import type { MarkdownParserEnv as DefaultMarkdownParserEnv } from '@vitebook/plugin-markdown/node';

export type VueMarkdownParserEnv = DefaultMarkdownParserEnv & {
  hoistedTags?: string[];
};
