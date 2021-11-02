import { derived } from 'svelte/store';

import { localizedThemeConfig } from '../../stores/localizedThemeConfig';

export const navbarConfig = derived(localizedThemeConfig, (theme) =>
  theme.navbar !== false ? theme.navbar : undefined,
);
