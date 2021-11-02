import type {
  DefaultLoadedPage,
  DefaultPageModule,
  Page as DefaultPage,
} from '@vitebook/core';
import type { SvelteComponent } from 'svelte';

export type SveltePage = DefaultPage<SveltePageModule> & {
  type: 'svelte';
};

export type SvelteConstructor = typeof SvelteComponent;

export type SvelteModule = {
  default: SvelteConstructor;
};

export type SveltePageModule = DefaultPageModule<SvelteConstructor>;

export type LoadedSveltePage = DefaultLoadedPage<SveltePageModule>;
