import type {
  ClientLayout as BaseClientLayout,
  ClientPage as BaseClientPage,
  ClientPageModule as BaseClientPageModule,
  LoadedClientLayout as BaseLoadedClientLayout,
  LoadedClientPage as BaseLoadedClientPage,
  MarkdownMeta,
} from '@vitebook/core';
import type { SvelteComponent } from 'svelte';

export type SvelteConstructor = typeof SvelteComponent;

export type SvelteModule = {
  readonly default: SvelteConstructor;
};

export type ClientPage = BaseClientPage<ClientPageModule>;

export type ClientPageModule = BaseClientPageModule<SvelteConstructor>;

export type LoadedClientPage = BaseLoadedClientPage<ClientPageModule>;

export type LoadedClientMarkdownPage = LoadedClientPage & {
  readonly meta: MarkdownMeta;
};

export type ClientLayout = BaseClientLayout<SvelteModule>;

export type LoadedClientLayout = BaseLoadedClientLayout<SvelteModule>;

export {};
