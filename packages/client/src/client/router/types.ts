import type { SvelteComponent } from 'svelte';
import type { Readable } from 'svelte/store';

export type RoutePrefetch = (location: RouteLocation) => void | Promise<void>;

export type RouteLoader = (
  location: RouteLocation
) => typeof SvelteComponent | Promise<typeof SvelteComponent>;

export type Route = {
  path: string;
  prefetch?: RoutePrefetch;
  loader: RouteLoader;
};

export type RouterOptions = {
  baseUrl: string;
  history: History;
  routes?: Route[];
};

export type RouteLocation = {
  id: string;
  path: string;
  route: Route;
  hash: string;
  query: URLSearchParams;
};

export type LoadedRouteLocation = RouteLocation & {
  component: typeof SvelteComponent;
};

export type NavigationOptions = {
  url: URL;
  scroll?: { x: number; y: number };
  keepfocus?: boolean;
  hash?: string;
};
