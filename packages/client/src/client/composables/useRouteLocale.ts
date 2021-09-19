import { resolveLocalePath, SiteOptions } from '@vitebook/core/shared';
import { Ref, ref, shallowReadonly, watchEffect } from 'vue';
import { Router } from 'vue-router';

import { useSiteOptions } from './useSiteOptions';

export type RouteLocaleRef = Ref<string>;

const routeLocaleRef: RouteLocaleRef = ref('/');

export function initRouteLocaleRef(router: Router): void {
  const siteOptions = useSiteOptions();

  watchEffect(() => {
    routeLocaleRef.value = resolveRouteLocale(
      siteOptions.value.baseUrl,
      siteOptions.value.locales,
      router.currentRoute.value.path
    );
  });
}

/**
 * The current locale path extracted from the route such as `/` or `/zh`. This is determined based
 * on the locales defined in `SiteConfig['locales']`.
 */
export function useRouteLocale(): Readonly<RouteLocaleRef> {
  return shallowReadonly(routeLocaleRef);
}

const resolveRouteLocale = (
  baseUrl: string,
  locales: SiteOptions['locales'],
  routePath: string
): string => resolveLocalePath(baseUrl, locales, routePath);
