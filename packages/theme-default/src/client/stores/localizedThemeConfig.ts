import { localizedSiteOptions } from '@vitebook/client';
import { derived } from 'svelte/store';

import { DefaultThemeConfig, defaultThemeLocaleOptions } from '../../shared';

export const localizedThemeConfig = derived(localizedSiteOptions, (site) => ({
  ...defaultThemeLocaleOptions,
  ...(site.theme as DefaultThemeConfig),
}));
