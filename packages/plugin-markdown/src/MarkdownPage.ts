import type { Page, ResolvedPage, ServerPage } from '@vitebook/core';

import type { MarkdownData } from './parser/index.js';

export type MarkdownPage = Page<MarkdownPageModule> & {
  type: 'md';
};

export type MarkdownPageModule<Data extends MarkdownData = MarkdownData> = {
  /** Parsed HTML template from markdown file. */
  template: string;
  data: Data;
};

export type ServerMarkdownPage = ServerPage & {
  type: 'md';
};

export type ResolvedMarkdownPage = ResolvedPage & {
  type: 'md';
};
