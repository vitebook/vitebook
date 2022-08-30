import { getContext } from 'svelte';
import { type Router, type ServerContext } from 'vitebook';

import {
  FRONTMATTER_KEY,
  MARKDOWN_KEY,
  NAVIGATION_KEY,
  PAGE_KEY,
  ROUTE_KEY,
  ROUTER_KEY,
  SERVER_CONTEXT_KEY,
} from './context-keys';
import type {
  FrontmatterStore,
  MarkdownStore,
  NavigationStore,
  PageStore,
  RouteStore,
} from './stores';

export function getRouter(): Router {
  return getContext(ROUTER_KEY);
}

export function getPageStore(): PageStore {
  return getContext(PAGE_KEY);
}

export function getRouteStore(): RouteStore {
  return getContext(ROUTE_KEY);
}

export function getNavigationStore(): NavigationStore {
  return getContext(NAVIGATION_KEY);
}

export function getMarkdownStore(): MarkdownStore {
  return getContext(MARKDOWN_KEY);
}

export function getFrontmatterStore(): FrontmatterStore {
  return getContext(FRONTMATTER_KEY);
}

export function getServerContext(): ServerContext {
  return getContext(SERVER_CONTEXT_KEY);
}
