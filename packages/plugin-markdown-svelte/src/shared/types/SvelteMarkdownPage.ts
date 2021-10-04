import type {
  DefaultLoadedPage,
  DefaultPageModule,
  Page
} from '@vitebook/core/shared';
import type { MarkdownPageMeta } from '@vitebook/plugin-markdown/shared';
import type { SveltePageContext } from '@vitebook/plugin-svelte/shared';
import type { Component } from 'vue';

export type SvelteMarkdownPage = Page<
  SvelteMarkdownPageModule,
  SveltePageContext
> & {
  type: 'svelte:md';
};

export type SvelteMarkdownPageModule = DefaultPageModule<
  Component,
  MarkdownPageMeta
>;

export type LoadedSvelteMarkdownPage = DefaultLoadedPage<
  SvelteMarkdownPageModule,
  SveltePageContext
>;
