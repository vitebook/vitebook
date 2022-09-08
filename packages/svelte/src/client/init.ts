import {
  derived,
  get,
  type Readable,
  type Writable,
  writable,
} from 'svelte/store';
import {
  initRouter,
  isLoadedMarkdownPage,
  type LoadedClientPage,
  type LoadedRoute,
  type Reactive,
  type RouteNavigation,
  type ServerContext,
} from 'vitebook';

import {
  FRONTMATTER_KEY,
  MARKDOWN_KEY,
  NAVIGATION_KEY,
  PAGE_KEY,
  ROUTE_KEY,
  ROUTER_KEY,
  SERVER_CONTEXT_KEY,
} from './context-keys';
import type { FrontmatterStore, MarkdownStore, PageStore } from './stores';
import { layouts } from './stores/layouts';
import { pages } from './stores/pages';

export type InitOptions = {
  serverContext?: ServerContext;
};

export async function init({ serverContext }: InitOptions = {}) {
  const route = writable<LoadedRoute>();
  const navigation = writable<RouteNavigation>();
  const page = writable<LoadedClientPage>();
  const markdown = createMarkdownStore(page);
  const frontmatter = createFronmatterStore(markdown);

  const router = await initRouter({
    $route: toReactive(route),
    $navigation: toReactive(navigation),
    $pages: toReactive(pages),
    $layouts: toReactive(layouts),
    $currentPage: toReactive(page),
    serverContext,
  });

  const context = new Map<string | symbol, unknown>();
  context.set(ROUTE_KEY, { subscribe: route.subscribe });
  context.set(NAVIGATION_KEY, { subscribe: navigation.subscribe });
  context.set(PAGE_KEY, { subscribe: page.subscribe });
  context.set(MARKDOWN_KEY, markdown);
  context.set(FRONTMATTER_KEY, frontmatter);
  context.set(ROUTER_KEY, router);
  context.set(SERVER_CONTEXT_KEY, serverContext);

  return { page, router, context };
}

function toReactive<T>(store: Readable<T> | Writable<T>): Reactive<T> {
  return {
    get: () => get(store),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    set: 'set' in store ? store.set : () => {},
    subscribe: store.subscribe,
  };
}

function createMarkdownStore(page: PageStore): MarkdownStore {
  return derived(page, ($page) =>
    isLoadedMarkdownPage($page) ? $page.meta : undefined,
  );
}

function createFronmatterStore(markdown: MarkdownStore): FrontmatterStore {
  return derived(markdown, ($markdown) => $markdown?.frontmatter ?? {});
}
