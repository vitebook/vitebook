import type {
  DefaultLoadedPage,
  DefaultPageModule,
  MarkdownPageMeta,
  Page
} from '@vitebook/core/shared';
import type { Component } from 'vue';

export type MarkdownPage = Page<MarkdownPageModule> & {
  type: 'md';
};

export type MarkdownPageModule = DefaultPageModule<Component, MarkdownPageMeta>;

export type LoadedMarkdownPage = DefaultLoadedPage<MarkdownPageModule>;

export type {
  MarkdownFrontmatter,
  MarkdownHeader,
  MarkdownLinks,
  MarkdownPageMeta
} from '@vitebook/core/shared';
