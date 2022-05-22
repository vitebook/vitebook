import { type LoadedClientPage } from '../../shared';

export type RoutePrefetch = (route: Route) => void | Promise<void>;

export type RouteLoader = (
  route: Route,
) => LoadedClientPage | Promise<LoadedClientPage>;

export type RouteDeclaration = {
  path: string;
  redirect?: string;
  prefetch?: RoutePrefetch;
  loader: RouteLoader;
};

export type RouterOptions = {
  target: HTMLElement | null;
  context: Map<string, unknown>;
  baseUrl: string;
  history: History;
  routes?: RouteDeclaration[];
};

export type Route = RouteDeclaration & {
  id: string;
  url: URL;
};

export type LoadedRoute = Route & {
  page: LoadedClientPage;
};

export type NavigationOptions = {
  url: URL;
  scroll?: RouterScrollOptions;
  keepfocus?: boolean;
  hash?: string;
};

export type GoToRouteOptions = {
  scroll?: RouterScrollOptions;
  replace?: boolean;
  keepfocus?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state?: any;
};

export type RouterScrollOptions =
  | false
  | null
  | undefined
  | (ScrollToOptions & { el?: string | HTMLElement });

export type RouterScrollBehaviorHook = (
  from: LoadedRoute,
  to: LoadedRoute,
  savedPosition?: { top?: number; left?: number },
) => RouterScrollOptions | Promise<RouterScrollOptions>;

export type RouterBeforeNavigateHook = (
  from: RouteDeclaration,
  to: RouteDeclaration,
) => void | false | { redirect: string } | Promise<void | { redirect: string }>;

export type RouterAfterNavigateHook = (
  from: LoadedRoute,
  to: LoadedRoute,
) => void | Promise<void>;
