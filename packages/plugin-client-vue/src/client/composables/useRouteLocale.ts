import type { SiteOptions } from '@vitebook/core';
import { computed, ComputedRef, watch } from 'vue';
import { Router } from 'vue-router';

import { resolveLocalePath } from '../helpers/resolveLocalePath';
import { useSiteOptions } from './useSiteOptions';

export type RouteLocaleRef = ComputedRef<string>;

let routeLocaleRef: RouteLocaleRef;

export function initRouteLocaleRef(router: Router): void {
  const siteOptions = useSiteOptions();

  routeLocaleRef = computed(() =>
    resolveRouteLocale(
      siteOptions.value.locales,
      router.currentRoute.value.path
    )
  );

  watch(
    () => routeLocaleRef.value,
    (r) => console.log(r),
    { immediate: true }
  );
}

export function useRouteLocale(): RouteLocaleRef {
  return routeLocaleRef;
}

export const resolveRouteLocale = (
  locales: SiteOptions['locales'],
  routePath: string
): string => resolveLocalePath(locales, routePath);
