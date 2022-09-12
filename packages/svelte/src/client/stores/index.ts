import type { Readable } from 'svelte/store';
import type {
  LoadedClientRoute,
  MarkdownFrontmatter,
  MarkdownMeta,
  Navigation,
} from 'vitebook';

import {
  getFrontmatterStore,
  getMarkdownStore,
  getNavigationStore,
  getRouteStore,
} from '../context';

export type NavigationStore = Readable<Navigation>;

export const navigation: NavigationStore = {
  subscribe: (fn) => getNavigationStore().subscribe(fn),
};

export type RouteStore = Readable<LoadedClientRoute>;

export const route: RouteStore = {
  subscribe: (fn) => getRouteStore().subscribe(fn),
};

export type MarkdownStore = Readable<MarkdownMeta | undefined>;

export const markdown: MarkdownStore = {
  subscribe: (fn) => getMarkdownStore().subscribe(fn),
};

export type FrontmatterStore = Readable<MarkdownFrontmatter>;

export const frontmatter: FrontmatterStore = {
  subscribe: (fn) => getFrontmatterStore().subscribe(fn),
};
