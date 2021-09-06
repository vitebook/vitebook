import type { MarkdownParserEnv as DefaultMarkdownParserEnv } from '@vitebook/plugin-markdown';

export type MarkdownVueParserEnv = DefaultMarkdownParserEnv & {
  hoistedTags?: string[];
};
