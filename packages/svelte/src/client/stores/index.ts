import type { Readable } from 'svelte/store';
import type {
  LoadedClientPage,
  LoadedRoute,
  MarkdownFrontmatter,
  MarkdownMeta,
  RouteNavigation,
} from 'vitebook';

import {
  getFrontmatterStore,
  getMarkdownStore,
  getNavigationStore,
  getPageStore,
  getRouteStore,
} from '../context';

export type PageStore = Readable<LoadedClientPage>;

export const page: PageStore = {
  subscribe: (fn) => getPageStore().subscribe(fn),
};

export type NavigationStore = Readable<RouteNavigation>;

export const navigation: NavigationStore = {
  subscribe: (fn) => getNavigationStore().subscribe(fn),
};

export type RouteStore = Readable<LoadedRoute>;

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
