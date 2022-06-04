import type { PageRoute, WithRouteMatch } from '../Page';
import { noslash, slash } from './url';

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

const bonusRegexRE = /\(.*?\)/;
const bonusExtRE = /\.html$/;
const penaltyOptionalRE = /(^\/:(\w|\.)+\?)|({:?.*?}\?)|(\(.*?\)\?)/;
const penaltyWildcardRE = /^\/(\*|(:?\w*?\*))/;
const penaltyRepeatableRE = /^\/(:(\w|\.)+(\+|\*))|({:?.*?}(\+|\*))/;
const penaltyRegexWildcardRE = /(\(\.\*\??\)|(\.\+\??))/;

const scoreCache = new Map<string, number>();
export function calcRoutePathScore(pathname: string): number {
  if (scoreCache.has(pathname)) return scoreCache.get(pathname)!;

  const segments = splitRoutePath(pathname);

  let score = 0;

  for (const segment of segments) {
    if (segment === '/') {
      score += PATH_SCORE.Root + PATH_SCORE.Segment;
      continue;
    }

    const isDynamic = isRoutePathDynamic(segment);
    const isNamedGroup = segment.startsWith('/:') || segment.startsWith('/{:');

    let isSegment = true;

    if (bonusExtRE.test(segment)) {
      score += PATH_SCORE.BonusExt;
    }

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

  const segmentsA = splitRoutePath(routeA.pathname).length;
  const segmentsB = splitRoutePath(routeB.pathname).length;

  return segmentsA != segmentsB
    ? segmentsB - segmentsA // deeper path first
    : routeB.pathname.length - routeA.pathname.length; // longer path first
}

const trailingHtmlExtGroupRE = /{\.html}\?$/;
const trailingSlashGroupRE = /{\/}\?{index}\?{\.html}\?$/;
export function cleanRoutePath(pathname: string) {
  return pathname
    .replace(trailingSlashGroupRE, '/index.html')
    .replace(trailingHtmlExtGroupRE, '.html');
}

const routeSplitRE = /\/(?![^{(]*}|\))/g; // split by / but ignore if inside () or {}
export function splitRoutePath(pathname: string) {
  return noslash(cleanRoutePath(pathname)).split(routeSplitRE).map(slash);
}

const dynamicPathRE = /(\*|\(.*\)|{.*}|\/:)/;
export function isRoutePathDynamic(pathname: string) {
  return (
    pathname.startsWith('/:') || dynamicPathRE.test(cleanRoutePath(pathname))
  );
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
    route.pattern.test(cleanRouteMatchingURL(url)),
  );

  const route = normalized[index];

  const match = execRouteMatch(url, route);

  return route && match ? { index, route, match } : undefined;
}

export function execRouteMatch<T extends PageRoute>(url: URL, route?: T) {
  return route?.pattern.exec(cleanRouteMatchingURL(url))?.pathname;
}

const htmlExtRE = /\.html$/;
export function cleanRouteMatchingURL(url: URL) {
  return `http://test${url.pathname.replace(htmlExtRE, '')}`;
}
