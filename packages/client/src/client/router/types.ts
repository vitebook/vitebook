import type { SvelteConstructor, SvelteModule } from '../../shared';

export type RoutePrefetch = (location: RouteLocation) => void | Promise<void>;

export type RouteComponent =
  | SvelteConstructor
  | {
      adapter: SvelteConstructor;
      component: unknown;
    };

export type RouteLoaderComponent = SvelteConstructor | SvelteModule;

export type RouteLoader = (
  location: RouteLocation,
) =>
  | RouteComponent
  | Promise<RouteComponent>
  | RouteLoaderComponent
  | Promise<RouteLoaderComponent>;

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
  decodedPath: string;
  query: URLSearchParams;
};

export type LoadedRouteLocation = RouteLocation & {
  component: RouteComponent;
};

export type NavigationOptions = {
  url: URL;
  scroll?: false | { x: number; y: number };
  keepfocus?: boolean;
  hash?: string;
};

export type GoToRouteOptions = {
  scroll?: false | { x: number; y: number };
  replace?: boolean;
  keepfocus?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state?: any;
};
