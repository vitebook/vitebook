import LRUCache from 'lru-cache';
import path from 'upath';

import { removeLeadingSlash } from '../../../../shared';

// Splits route by `/` and retain splitter.
const splitRouteRE = /(.*?\/)/g;
const splitRoute = (route: string) => route.split(splitRouteRE).slice(3);

const orderedPageTokenRE = /^\[(\d)\]/;

const cache = new LRUCache<string, number>({ max: 2048 });

export function sortPaths(paths: string[], { ordered = false } = {}): string[] {
  return paths.sort((pathA, pathB) => {
    const cacheKey = pathA + pathB;

    if (cache.has(cacheKey)) return cache.get(cacheKey)!;

    const result = comparePaths(pathA, pathB, { ordered });

    cache.set(cacheKey, result);
    return result;
  });
}

export function comparePaths(
  pathA: string,
  pathB: string,
  { ordered = false } = {},
): number {
  const cacheKey = pathA + pathB;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  // `@layout` files should always come first.
  if (path.basename(pathA) === '@layout.svelte') {
    return pathA.includes('@vbk/')
      ? path.basename(pathB) === 'layout.svelte' && !pathB.includes('@vbk/')
        ? -1
        : 1
      : -1;
  }

  const tokensA = splitRoute(`<root>/${removeLeadingSlash(pathA)}`);
  const tokensB = splitRoute(`<root>/${removeLeadingSlash(pathB)}`);
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
}
