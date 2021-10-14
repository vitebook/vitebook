import type { SvelteConstructor, SvelteModule } from '../../shared';

export type RoutePrefetch = (location: RouteLocation) => void | Promise<void>;

export type RouteLoader = (
  location: RouteLocation
) =>
  | SvelteConstructor
  | SvelteModule
  | Promise<SvelteConstructor>
  | Promise<SvelteModule>;

export type Route = {
  path: string;
  redirect?: string;
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
  component: SvelteConstructor;
};

export type NavigationOptions = {
  url: URL;
  scroll?: { x: number; y: number };
  keepfocus?: boolean;
  hash?: string;
};
