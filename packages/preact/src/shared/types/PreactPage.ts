import type { SvelteConstructor } from '@vitebook/client';
import type {
  DefaultLoadedPage,
  DefaultPageModule,
  Page,
  ServerPage,
} from '@vitebook/core';
import type { FunctionComponent as PreactComponent } from 'preact';

export type PreactPageType = 'preact:jsx' | 'preact:tsx';

export type PreactPage = Page<PreactPageModule, PreactPageContext> & {
  type: PreactPageType;
};

export type PreactServerPage = ServerPage<PreactServerPageContext> & {
  type: PreactPageType;
};

export type PreactPageModule = DefaultPageModule<SvelteConstructor>;

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
