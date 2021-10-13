import type {
  DefaultLoadedPage,
  DefaultPageModule,
  MarkdownPageMeta,
  Page
} from '@vitebook/core/shared';
import type { Component } from 'vue';

export type VueMarkdownPage = Page<VueMarkdownPageModule> & {
  type: 'vue:md';
};

export type VueMarkdownPageModule = DefaultPageModule<
  Component,
  MarkdownPageMeta
>;

export type LoadedVueMarkdownPage = DefaultLoadedPage<VueMarkdownPageModule>;

export type {
  MarkdownFrontmatter,
  MarkdownHeader,
  MarkdownLinks,
  MarkdownPageMeta
} from '@vitebook/core/shared';
