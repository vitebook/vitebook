import type { MarkdownParserEnv as DefaultMarkdownParserEnv } from '@vitebook/plugin-markdown/node';

export type PreactMarkdownParserEnv = DefaultMarkdownParserEnv & {
  hoistedTags?: string[];
};
