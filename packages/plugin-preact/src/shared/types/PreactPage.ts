import type {
  DefaultLoadedPage,
  DefaultPageModule,
  Page,
  ServerPage
} from '@vitebook/core/shared';
import type { FunctionComponent as PreactComponent } from 'preact';
import type { Component as VueComponent } from 'vue';

export type PreactPage = Page<PreactPageModule, PreactPageContext> & {
  type: 'preact:jsx' | 'preact:tsx';
};

export type PreactServerPage = ServerPage<PreactServerPageContext> & {
  type: 'preact:jsx' | 'preact:tsx';
};

export type PreactPageModule = DefaultPageModule<VueComponent>;

export type LoadedPreactPage = DefaultLoadedPage<
  PreactPageModule,
  PreactPageContext
>;

export type PreactLoaderModule = DefaultPageModule<PreactComponent>;

export type PreactPageContext = {
  loader: () => Promise<PreactLoaderModule>;
};

export type PreactServerPageContext = {
  loader: string;
};

export type ResolvedPreactServerPage = Partial<PreactServerPage>;
