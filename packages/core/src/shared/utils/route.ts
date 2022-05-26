import type { PageRoute, WithRouteMatch } from '../Page';

const PATH_SCORE = {
  Segment: 6,
  Static: 5,
  Group: 3, // /:id or /{:id} or /something{:id}
  Dynamic: 2,
  Root: 1, // /
  BonusRegExp: 1, // /:id(\\d+)
  PenaltyOptional: -1, // /:id? or {id}?
  PenaltyWildcard: -7, // /posts/* or /:id*
  PenaltyRepeatable: -8, // /:id+ or /:id* or {id}+
  PenaltyRegexWildcard: -10, // /(.*)
};

const splitPathRE = /\//g;
const dynamicPathRE = /(\*|\((?!\/).*\)|{(?!\/).*}|\/:)/;

const bonusRegexRE = /\(.*?\)/;

const penaltyOptionalRE = /(^\/:(\w|\.)+\?)|({:?.*?}\?)/;
const penaltyWildcardRE = /^\/(\*|(:?\w*?\*))/;
const penaltyRepeatableRE = /^\/(:(\w|\.)+(\+|\*))|({:?.*?}(\+|\*))/;
const penaltyRegexWildcardRE = /(\(\.\*\??\)|(\.\+\??))/;

const scoreCache = new Map<string, number>();
export function calcRoutePathScore(pathname: string): number {
  if (scoreCache.has(pathname)) return scoreCache.get(pathname)!;

  const segments =
    pathname === '/'
      ? pathname
      : pathname.split(splitPathRE).map((s) => `/${s}`);

  let score = 0;

  for (const segment of segments) {
    score += PATH_SCORE.Segment;

    if (segment === '/') {
      score += PATH_SCORE.Root;
      continue;
    }

    const isDynamic = isRoutePathDynamic(segment);
    const isNamedGroup = segment.startsWith('/:') || segment.startsWith('/{:');

    if (isNamedGroup) {
      score += PATH_SCORE.Group;
    } else if (isDynamic) {
      score += PATH_SCORE.Dynamic;
    }

    if (isNamedGroup || isDynamic) {
      if (bonusRegexRE.test(segment)) {
        score += PATH_SCORE.BonusRegExp;
      }

      if (penaltyOptionalRE.test(segment)) {
        score += PATH_SCORE.PenaltyOptional;
      }

      if (penaltyWildcardRE.test(segment)) {
        score += PATH_SCORE.PenaltyWildcard;
      }

      if (penaltyRepeatableRE.test(segment)) {
        score += PATH_SCORE.PenaltyRepeatable;
      }

      if (penaltyRegexWildcardRE.test(segment)) {
        score += PATH_SCORE.PenaltyRegexWildcard;
      }
    } else {
      score += PATH_SCORE.Static;
    }
  }

  scoreCache.set(pathname, score);
  return score;
}

export function compareRoutes(routeA: PageRoute, routeB: PageRoute) {
  if (routeA.score !== routeB.score) {
    return routeB.score - routeA.score; // higher score first
  }

  const segmentsA = routeA.pathname.split(splitPathRE).length;
  const segmentsB = routeA.pathname.split(splitPathRE).length;

  return segmentsA != segmentsB
    ? segmentsB - segmentsA // deeper path first
    : routeB.pathname.length - routeA.pathname.length; // longer path first
}

export function isRoutePathDynamic(path: string) {
  return path.startsWith('/:') || dynamicPathRE.test(path);
}

export function matchRoute<T extends PageRoute>(
  url: URL,
  routes: T[] | { route: T }[],
): WithRouteMatch<T> | undefined {
  const result = matchRouteInfo(url, routes);
  return result ? { ...result.route, match: result.match } : undefined;
}

export function matchRouteInfo<T extends PageRoute>(
  url: URL,
  routes: T[] | { route: T }[],
): WithRouteMatch<{ index: number; route: T }> | undefined {
  const cleanUrl = cleanRouteMatchingURL(url);

  const normalized: T[] =
    'route' in routes[0] ? routes.map((r) => r.route) : routes;

  const index = normalized.findIndex((route) =>
    route.pattern.test(route.dynamic ? cleanUrl : url),
  );

  const route = normalized[index];

  const match = execRouteMatch(url, route);

  return route && match ? { index, route, match } : undefined;
}

export function execRouteMatch<T extends PageRoute>(url: URL, route?: T) {
  return route?.pattern.exec(route.dynamic ? cleanRouteMatchingURL(url) : url)
    ?.pathname;
}

export function cleanRouteMatchingURL(url: URL) {
  const path = url.toString();
  return path === '/' ? path : path.replace(/(\.html|\/)($|\?)/, '');
}
