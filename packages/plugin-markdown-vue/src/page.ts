import type { Page, ResolvedPage, ServerPage } from '@vitebook/core';
import type { MarkdownData } from '@vitebook/plugin-markdown';
import type { Component } from 'vue';

export type MarkdownVuePage = Page<MarkdownVuePageModule> & {
  type: 'md.vue';
};

export type MarkdownVuePageModule<Data extends MarkdownData = MarkdownData> = {
  default: Component;
  data: Data;
};

export type ServerMarkdownVuePage = ServerPage & {
  type: 'md.vue';
};

export type ResolvedMarkdownVuePage = ResolvedPage & {
  type: 'md.vue';
};
