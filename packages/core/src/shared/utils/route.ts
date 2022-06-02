import type { PageRoute, WithRouteMatch } from '../Page';

const PATH_SCORE = {
  Segment: 6,
  Static: 5,
  Group: 3, // /:id or /{:id} or /something{:id}
  Dynamic: 2,
  Root: 1, // /
  BonusRegExp: 1, // /:id(\d+)
  BonusExt: 3, // .html
  PenaltyOptional: -1, // /:id? or {id}? or (\d)?
  PenaltyWildcard: -7, // /posts/* or /:id*
  PenaltyRepeatable: -8, // /:id+ or /:id* or {id}+
  PenaltyRegexWildcard: -10, // /(.*)
};

const splitPathRE = /\//g;
const dynamicPathRE = /(\*|\((?!\/).*\)|{(?!\/).*}|\/:)/;

const bonusRegexRE = /\(.*?\)/;
const bonusExt = /\.html$/;

const penaltyOptionalRE = /(^\/:(\w|\.)+\?)|({:?.*?}\?)|(\(.*?\)\?)/;
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

  if (bonusExt.test(pathname)) {
    score += PATH_SCORE.BonusExt;
  }

  for (const segment of segments) {
    if (segment === '/') {
      score += PATH_SCORE.Root + PATH_SCORE.Segment;
      continue;
    }

    const isDynamic = isRoutePathDynamic(segment);
    const isNamedGroup = segment.startsWith('/:') || segment.startsWith('/{:');

    let isSegment = true;

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
        isSegment = false;
      }

      if (penaltyWildcardRE.test(segment)) {
        score += PATH_SCORE.PenaltyWildcard;
        isSegment = false;
      }

      if (penaltyRepeatableRE.test(segment)) {
        score += PATH_SCORE.PenaltyRepeatable;
        isSegment = false;
      }

      if (penaltyRegexWildcardRE.test(segment)) {
        score += PATH_SCORE.PenaltyRegexWildcard;
        isSegment = false;
      }
    } else {
      score += PATH_SCORE.Static;
    }

    if (isSegment) score += PATH_SCORE.Segment;
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
  const normalized: T[] =
    'route' in routes[0] ? routes.map((r) => r.route) : routes;

  const index = normalized.findIndex((route) =>
    route.pattern.test(cleanRouteMatchingURL(url, route)),
  );

  const route = normalized[index];

  const match = execRouteMatch(url, route);

  return route && match ? { index, route, match } : undefined;
}

export function execRouteMatch<T extends PageRoute>(url: URL, route?: T) {
  return route?.pattern.exec(cleanRouteMatchingURL(url, route))?.pathname;
}

export function cleanRouteMatchingURL(url: URL, route: PageRoute) {
  return `http://test${
    route.dynamic ? url.pathname.replace(/\.html$/, '') : url.pathname
  }`;
}
