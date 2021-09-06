import type { MarkdownData } from '@vitebook/plugin-markdown';

export enum MarkdownVueHmrEvent {
  DataUpdate = `vitebook/markdown-vue::dataUpdate`
}

export type MarkdownVueHmrPayload = {
  [MarkdownVueHmrEvent.DataUpdate]: {
    route: string;
    data: MarkdownData;
  };
};
