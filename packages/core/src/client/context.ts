import { type AppContextMap, type ServerContext } from '../shared';
import { type Router } from './router/Router';
import {
  createFrontmatterStore,
  createMarkdownStore,
  type FrontmatterStore,
  type MarkdownStore,
} from './stores/markdown';
import { createPageStore, type PageStore } from './stores/page';
import { createRouteStore, type RouteStore } from './stores/route';
import { type ViewRenderer } from './view/ViewRenderer';

export const SERVER_CTX_KEY = 'vitebook::server';
export const RENDERERS_CTX_KEY = 'vitebook::renderers';
export const ROUTER_CTX_KEY = 'vitebook::router';

export const ROUTE_CTX_KEY = 'vitebook::route';
export const PAGE_CTX_KEY = 'vitebook::page';
export const MARKDOWN_CTX_KEY = 'vitebook::markdown';
export const FRONTMATTER_CTX_KEY = 'vitebook::frontmatter';

export type ContextTypes = {
  [SERVER_CTX_KEY]: ServerContext;
  [RENDERERS_CTX_KEY]: ViewRenderer[];
  [ROUTER_CTX_KEY]: Router[];
  [ROUTE_CTX_KEY]: RouteStore;
  [PAGE_CTX_KEY]: PageStore;
  [MARKDOWN_CTX_KEY]: MarkdownStore;
  [FRONTMATTER_CTX_KEY]: FrontmatterStore;
};

export function getContext<T extends keyof ContextTypes>(
  context: AppContextMap,
  key: T,
) {
  return context.get(key) as ContextTypes[T];
}

export function initAppContext() {
  const context = new Map();

  const route = createRouteStore();
  const page = createPageStore();
  const markdown = createMarkdownStore(page);
  const frontmatter = createFrontmatterStore(markdown);

  context.set(ROUTE_CTX_KEY, route);
  context.set(PAGE_CTX_KEY, page);
  context.set(MARKDOWN_CTX_KEY, markdown);
  context.set(FRONTMATTER_CTX_KEY, frontmatter);

  return context;
}
