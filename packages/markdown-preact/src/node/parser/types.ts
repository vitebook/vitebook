import type { MarkdownParserEnv as DefaultMarkdownParserEnv } from '@vitebook/markdown/node';

export type PreactMarkdownParserEnv = DefaultMarkdownParserEnv & {
  hoistedTags?: string[];
};
