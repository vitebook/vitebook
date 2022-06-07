import {
  type AppContextMap,
  type LoadedClientPage,
  type PageRoute,
  WithRouteMatch,
} from '../../shared';

export type RedirectRoute = (pathnameOrURL: string | URL) => void;

export type RoutePrefetch = (info: {
  url: URL;
  route: Route;
  redirect: RedirectRoute;
}) => void | Promise<void>;

export type RouteLoader = (info: {
  route: Route;
  redirect: RedirectRoute;
}) => void | LoadedClientPage | Promise<void | LoadedClientPage>;

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
  from: URL;
  to: URL;
} | null;

export type LoadedRoute = Route & {
  page: LoadedClientPage;
};

export type GoToRouteOptions = {
  scroll?: ScrollToTarget | null;
  keepfocus?: boolean;
  replace?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state?: any;
};

export type NavigationOptions = GoToRouteOptions & {
  accepted?: () => void;
  blocked?: () => void;
};

export type RouterScrollBase = ScrollToOptions;

export type ScrollTarget =
  | void
  | null
  | false
  | (ScrollToOptions & { el?: string | HTMLElement });

export type ScrollToTarget = (info: { cancel: ScrollCancel }) => ScrollTarget;

export type ScrollCancel = () => void;

export type RouterScrollBehaviorHook = (info: {
  from: LoadedRoute | null;
  to: LoadedRoute;
  cancel: ScrollCancel;
  savedPosition?: { top?: number; left?: number };
}) => ScrollTarget | Promise<ScrollTarget>;

export type CancelNavigation = () => void;

export type RouterBeforeNavigateHook = (navigation: {
  from: LoadedRoute | null;
  to: WithRouteMatch<RouteDeclaration>;
  match: URLPatternComponentResult;
  cancel: CancelNavigation;
  redirect: RedirectRoute;
}) => void;

export type RouterAfterNavigateHook = (navigation: {
  from: LoadedRoute | null;
  to: LoadedRoute;
  match: URLPatternComponentResult;
}) => void | Promise<void>;
