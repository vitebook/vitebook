import type {
  DefaultLoadedPage,
  DefaultPageModule,
  Page
} from '@vitebook/core/shared';
import type { MarkdownPageMeta } from '@vitebook/plugin-markdown/node';
import type { PreactPageContext } from '@vitebook/plugin-preact/node';
import type { Component } from 'vue';

export type PreactMarkdownPage = Page<
  PreactMarkdownPageModule,
  PreactPageContext
> & {
  type: 'preact:md';
};

export type PreactMarkdownPageModule = DefaultPageModule<
  Component,
  MarkdownPageMeta
>;

export type LoadedPreactMarkdownPage = DefaultLoadedPage<
  PreactMarkdownPageModule,
  PreactPageContext
>;
