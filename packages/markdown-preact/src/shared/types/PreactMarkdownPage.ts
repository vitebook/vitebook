import type {
  DefaultLoadedPage,
  DefaultPageModule,
  Page
} from '@vitebook/core/shared';
import type { MarkdownPageMeta } from '@vitebook/markdown/node';
import type { PreactPageContext } from '@vitebook/preact/node';
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
