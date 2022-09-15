import { noslash, slash } from 'shared/utils/url';

import type { Route } from './types';

const PATH_SCORE = {
  Segment: 6,
  Static: 5,
  Group: 3, // /:id or /{:id} or /something{:id}
  Dynamic: 2,
  BonusRegExp: 1, // /:id(\d+)
  BonusExt: 3, // .html
  PenaltyOptional: -4, // /:id? or {id}? or (\d)?
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

export function isLayoutRoute(route: Route): boolean {
  return route.type === 'layout';
}

export function isErrorRoute(route: Route): boolean {
  return route.type === 'error';
}

export function compareRoutes(routeA: Route, routeB: Route) {
  if (routeA.score !== routeB.score) {
    return routeB.score - routeA.score; // higher score first
  }

  const segmentsA = splitRoutePath(routeA.pattern.pathname).length;
  const segmentsB = splitRoutePath(routeB.pattern.pathname).length;

  return segmentsA != segmentsB
    ? segmentsB - segmentsA // deeper path first
    : routeB.pattern.pathname.length - routeA.pattern.pathname.length; // longer path first
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
