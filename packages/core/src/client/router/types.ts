import {
  type AppContextMap,
  type LoadedClientPage,
  type PageRoute,
} from '../../shared';

export type RoutePrefetch = (route: Route) => void | Promise<void>;

export type RouteLoader = (
  route: Route,
) => LoadedClientPage | Promise<LoadedClientPage>;

export type RouteDeclaration = Omit<PageRoute, 'score'> & {
  score?: number;
  prefetch?: RoutePrefetch;
  loader: RouteLoader;
};

export type ScoredRouteDeclaration = RouteDeclaration & {
  readonly score: number;
};

export type RouterOptions = {
  target: HTMLElement | null;
  context: AppContextMap;
  baseUrl: string;
  history: History;
  routes?: RouteDeclaration[];
};

export type Route = RouteDeclaration & {
  readonly id: string;
  readonly url: URL;
  readonly match: URLPatternComponentResult;
};

export type RouteNavigation = {
  url: URL;
  loading: boolean;
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

export type RouterBeforeNavigateHook = (navigation: {
  from: RouteDeclaration;
  to: RouteDeclaration;
  match: URLPatternComponentResult;
}) =>
  | void
  | false
  | { redirect: string }
  | Promise<void | { redirect: string }>;

export type RouterAfterNavigateHook = (navigation: {
  from: LoadedRoute;
  to: LoadedRoute;
  match: URLPatternComponentResult;
}) => void | Promise<void>;
