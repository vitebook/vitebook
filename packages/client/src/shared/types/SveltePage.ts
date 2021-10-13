import type {
  DefaultLoadedPage,
  DefaultPageModule,
  Page as DefaultPage
} from '@vitebook/core/shared';
import type { SvelteComponent } from 'svelte';

export type SveltePage = DefaultPage<SveltePageModule> & {
  type: 'svelte';
};

export type SveltePageModule = DefaultPageModule<typeof SvelteComponent>;

export type LoadedSveltePage = DefaultLoadedPage<SveltePageModule>;
