import { derived } from 'svelte/store';

import { localizedThemeConfig } from '../../stores/localizedThemeConfig';

export const homePageConfig = derived(localizedThemeConfig, (theme) =>
  theme.homePage !== false ? theme.homePage ?? {} : undefined,
);
