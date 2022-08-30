import type {
  LoadedClientPage,
  Route,
  RouteParams,
  ServerContext,
  WithRouteParams,
} from '../../shared';
import type { Reactive } from '../reactivity';
import type { ScrollToTarget } from './scroll-delegate';

export type RouteRedirect = (pathnameOrURL: string | URL) => void;

export type RoutePrefetch = (info: {
  url: URL;
  route: MatchedRoute;
  redirect: RouteRedirect;
}) => void | Promise<void>;

export type RouteLoader = (info: {
  route: MatchedRoute;
  redirect: RouteRedirect;
}) => void | LoadedClientPage | Promise<void | LoadedClientPage>;

export type RouteDeclaration = Route & {
  prefetch?: RoutePrefetch;
  loader: RouteLoader;
};

export type UserRouteDeclaration = Omit<RouteDeclaration, 'score'> & {
  score?: number;
};

export type ScoredRouteDeclaration = RouteDeclaration & {
  readonly score: number;
};

export type RouterOptions = {
  baseUrl: string;
  history: History;
  trailingSlash?: boolean;
  $route: Reactive<LoadedRoute>;
  $navigation: Reactive<RouteNavigation>;
  initialRoutes?: RouteDeclaration[];
  serverContext?: ServerContext;
};

export type MatchedRoute = RouteDeclaration & {
  readonly id: string;
  readonly url: URL;
  readonly params: RouteParams;
};

export type RouteNavigation = {
  from: URL;
  to: URL;
} | null;

export type LoadedRoute = MatchedRoute & {
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

export type CancelNavigation = () => void;

export type RouterBeforeNavigateHook = (navigation: {
  from: LoadedRoute | null;
  to: WithRouteParams<RouteDeclaration>;
  params: RouteParams;
  cancel: CancelNavigation;
  redirect: RouteRedirect;
}) => void;

export type RouterAfterNavigateHook = (navigation: {
  from: LoadedRoute | null;
  to: LoadedRoute;
  params: RouteParams;
}) => void | Promise<void>;
