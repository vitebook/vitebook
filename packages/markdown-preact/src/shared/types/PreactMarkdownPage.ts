import type { SvelteConstructor } from '@vitebook/client';
import type {
  DefaultLoadedPage,
  DefaultPageModule,
  Page,
} from '@vitebook/core';
import type { MarkdownPageMeta } from '@vitebook/markdown/node';
import type { PreactPageContext } from '@vitebook/preact/node';

export type PreactMarkdownPage = Page<
  PreactMarkdownPageModule,
  PreactPageContext
> & {
  type: 'preact:md';
};

export type PreactMarkdownPageModule = DefaultPageModule<
  SvelteConstructor,
  MarkdownPageMeta
>;

export type LoadedPreactMarkdownPage = DefaultLoadedPage<
  PreactMarkdownPageModule,
  PreactPageContext
>;
