import { derived } from 'svelte/store';

import { currentRouteLocale } from './currentRouteLocale';
import { siteOptions } from './siteOptions';

export const localizedSiteOptions = derived(
  [siteOptions, currentRouteLocale],
  ([site, routeLocale]) => ({
    ...site,
    ...site.locales?.[routeLocale],
    theme: {
      ...site.theme,
      ...site.theme.locales?.[routeLocale],
    },
  }),
);
