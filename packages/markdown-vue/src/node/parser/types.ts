import type { MarkdownParserEnv as DefaultMarkdownParserEnv } from '@vitebook/markdown/node';

export type VueMarkdownParserEnv = DefaultMarkdownParserEnv & {
  hoistedTags?: string[];
};
