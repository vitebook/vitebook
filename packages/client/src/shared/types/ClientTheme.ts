import type { Theme as DefaultTheme } from '@vitebook/core';

import type { Router } from '../../client/router/router';
import type { SvelteConstructor } from './SveltePage';

export type ClientThemeComponent =
  | SvelteConstructor
  | {
      adapter: SvelteConstructor;
      component: unknown;
    };

export type ClientTheme = DefaultTheme<ClientThemeComponent> & {
  configureRouter?(router: Router): void | Promise<void>;
};

export type VirtualClientThemeModule = {
  default: ClientTheme;
  [Symbol.toStringTag]: 'Module';
};
