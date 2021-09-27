import type { Page } from '@vitebook/core/shared';
import type { MarkdownPageMeta } from '@vitebook/plugin-markdown/shared';
import type { Component } from 'vue';

export type VueMarkdownPage = Page<VueMarkdownPageModule> & {
  type: 'vue:md';
};

export type VueMarkdownPageModule<
  PageMetaExport extends MarkdownPageMeta = MarkdownPageMeta
> = {
  default: Component;
  __pageMeta: PageMetaExport;
};
