import { getContext } from 'svelte';
import {
  type ContextTypes,
  FRONTMATTER_CTX_KEY,
  MARKDOWN_CTX_KEY,
  PAGE_CTX_KEY,
  ROUTE_CTX_KEY,
  ROUTER_CTX_KEY,
  SERVER_CTX_KEY,
} from 'vitebook';

export function getRouter() {
  return getContext(ROUTER_CTX_KEY) as ContextTypes[typeof ROUTER_CTX_KEY];
}

export function getPage() {
  return getContext(PAGE_CTX_KEY) as ContextTypes[typeof PAGE_CTX_KEY];
}

export function getRoute() {
  return getContext(ROUTE_CTX_KEY) as ContextTypes[typeof ROUTE_CTX_KEY];
}

export function getMarkdown() {
  return getContext(MARKDOWN_CTX_KEY) as ContextTypes[typeof MARKDOWN_CTX_KEY];
}

export function getFrontmatter() {
  return getContext(
    FRONTMATTER_CTX_KEY,
  ) as ContextTypes[typeof FRONTMATTER_CTX_KEY];
}

export function getServerContext() {
  return getContext(SERVER_CTX_KEY) as ContextTypes[typeof SERVER_CTX_KEY];
}
