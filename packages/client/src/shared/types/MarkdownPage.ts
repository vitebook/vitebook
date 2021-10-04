import type {
  DefaultLoadedPage,
  DefaultPageModule,
  MarkdownPageMeta,
  Page
} from '@vitebook/core/shared';
import type { Component } from 'vue';

export type MarkdownPage = Page<MarkdownPageModule> & {
  type: `${string}md`;
};

export type MarkdownPageModule = DefaultPageModule<Component, MarkdownPageMeta>;

export type LoadedMarkdownPage = DefaultLoadedPage<MarkdownPageModule>;
