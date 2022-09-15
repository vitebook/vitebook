import { tick } from 'svelte';
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

import App from ':virtual/vitebook/app';

import { type SvelteModule } from '../shared';
import {
  FRONTMATTER_KEY,
  MARKDOWN_KEY,
  NAVIGATION_KEY,
  ROUTE_KEY,
  ROUTER_KEY,
} from './context-keys';
import type { FrontmatterStore, MarkdownStore, RouteStore } from './stores';

async function main() {
  const { router, context } = await bootstrap();
  await router.start((target) => {
    const mod = App.module as SvelteModule;
    new mod.default({ target, context, hydrate: true });
  });
}

async function bootstrap() {
  const route = writable<LoadedClientRoute>();
  const navigation = writable<Navigation>();
  const markdown = createMarkdownStore(route);
  const frontmatter = createFronmatterStore(markdown);

  const router = await init({
    tick,
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
    isMarkdownModule($route.module) ? $route.module.__markdownMeta : undefined,
  );
}

function createFronmatterStore(markdown: MarkdownStore): FrontmatterStore {
  return derived(markdown, ($markdown) => $markdown?.frontmatter ?? {});
}

main();
