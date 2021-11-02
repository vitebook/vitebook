import { resolveLocalePath } from '@vitebook/core';
import { derived } from 'svelte/store';

import { currentRoute } from './currentRoute';
import { siteOptions } from './siteOptions';

export const currentRouteLocale = derived(
  [siteOptions, currentRoute],
  ([site, route]) =>
    route?.path
      ? resolveLocalePath(site.baseUrl, site.locales, route.path)
      : '/',
);
