import type { Theme as DefaultTheme } from '@vitebook/core/shared';
import type { SvelteComponent } from 'svelte';

import type { Router } from '../../client/router/router';

export type ClientTheme = DefaultTheme<typeof SvelteComponent> & {
  configureRouter?(router: Router): void | Promise<void>;
};

export type VirtualClientThemeModule = {
  default: ClientTheme;
};
