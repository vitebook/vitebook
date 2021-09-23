import type { Plugin } from '@vitebook/core/node';

import type { MarkdownParser } from './parser';

export type MarkdownPlugin = Plugin & {
  configureMarkdownParser?(parser: MarkdownParser): void | Promise<void>;
};
