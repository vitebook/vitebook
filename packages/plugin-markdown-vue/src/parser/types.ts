import type { MarkdownParserEnv as DefaultMarkdownParserEnv } from '@vitebook/plugin-markdown';

export type VueMarkdownParserEnv = DefaultMarkdownParserEnv & {
  hoistedTags?: string[];
};
