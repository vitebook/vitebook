import {
  derived,
  get,
  type Readable,
  type Writable,
  writable,
} from 'svelte/store';
import {
  init,
  isMarkdownModule,
  type LoadedClientRoute,
  type Navigation,
  type Reactive,
} from 'vitebook';

import {
  FRONTMATTER_KEY,
  MARKDOWN_KEY,
  NAVIGATION_KEY,
  ROUTE_KEY,
  ROUTER_KEY,
} from './context-keys';
import type { FrontmatterStore, MarkdownStore, RouteStore } from './stores';

export async function initClient() {
  const route = writable<LoadedClientRoute>();
  const navigation = writable<Navigation>();
  const markdown = createMarkdownStore(route);
  const frontmatter = createFronmatterStore(markdown);

  const router = await init({
    $route: toReactive(route),
    $navigation: toReactive(navigation),
  });

  const context = new Map<string | symbol, unknown>();
  context.set(ROUTE_KEY, { subscribe: route.subscribe });
  context.set(NAVIGATION_KEY, { subscribe: navigation.subscribe });
  context.set(MARKDOWN_KEY, markdown);
  context.set(FRONTMATTER_KEY, frontmatter);
  context.set(ROUTER_KEY, router);

  return { router, context };
}

function toReactive<T>(store: Readable<T> | Writable<T>): Reactive<T> {
  return {
    get: () => get(store),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    set: 'set' in store ? store.set : () => {},
    subscribe: store.subscribe,
  };
}

function createMarkdownStore(route: RouteStore): MarkdownStore {
  return derived(route, ($route) =>
    isMarkdownModule($route.leaf.module)
      ? $route.leaf.module.__markdownMeta
      : undefined,
  );
}

function createFronmatterStore(markdown: MarkdownStore): FrontmatterStore {
  return derived(markdown, ($markdown) => $markdown?.frontmatter ?? {});
}
