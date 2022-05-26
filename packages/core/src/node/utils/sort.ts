import LRUCache from 'lru-cache';

import { noslash } from '../../shared';

// Splits route by `/` and retain splitter.
const splitRouteRE = /(.*?\/)/g;
const splitRoute = (route: string) => route.split(splitRouteRE).slice(3);

const orderedPageTokenRE = /^\[(\d)\]/;

const sortCache = new LRUCache<string, number>({ max: 2048 });

export function comparePaths(
  pathA: string,
  pathB: string,
  { ordered = false } = {},
): number {
  const cacheKey = pathA + pathB;

  if (sortCache.has(cacheKey)) return sortCache.get(cacheKey)!;

  const compare = () => {
    const tokensA = splitRoute(`<root>/${noslash(pathA)}`);
    const tokensB = splitRoute(`<root>/${noslash(pathB)}`);
    const len = Math.max(tokensA.length, tokensB.length);

    for (let i = 0; i < len; i++) {
      if (!(i in tokensA)) {
        return -1;
      }

      if (!(i in tokensB)) {
        return 1;
      }

      const tokenA = tokensA[i].toLowerCase();
      const tokenB = tokensB[i].toLowerCase();

      if (ordered) {
        const tokenAOrderNo = tokensA[i].match(orderedPageTokenRE)?.[1];
        const tokenBOrderNo = tokensA[i].match(orderedPageTokenRE)?.[1];

        if (tokenAOrderNo && tokenBOrderNo) {
          const result = tokenAOrderNo < tokenBOrderNo ? -1 : 1;
          return result;
        }
      }

      if (tokenA === tokenB) {
        continue;
      }

      const isTokenADir = tokenA[tokenA.length - 1] === '/';
      const isTokenBDir = tokenB[tokenB.length - 1] === '/';

      if (isTokenADir === isTokenBDir) {
        const result = tokenA < tokenB ? -1 : 1;
        return result;
      } else {
        const result = isTokenADir ? 1 : -1;
        return result;
      }
    }

    return 0;
  };

  const result = compare();
  sortCache.set(cacheKey, result);
  return result;
}
