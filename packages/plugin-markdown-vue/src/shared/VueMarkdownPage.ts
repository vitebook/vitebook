import type {
  DefaultLoadedPage,
  DefaultPageModule,
  Page
} from '@vitebook/core/shared';
import type { MarkdownPageMeta } from '@vitebook/plugin-markdown/shared';
import type { Component } from 'vue';

export type VueMarkdownPage = Page<VueMarkdownPageModule> & {
  type: 'vue:md';
};

export type VueMarkdownPageModule = DefaultPageModule<
  Component,
  MarkdownPageMeta
>;

export type LoadedVueMarkdownPage = DefaultLoadedPage<VueMarkdownPageModule>;
