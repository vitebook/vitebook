import type { Plugin } from '@vitebook/core/node';

import { DefaultThemeIconsOptions, iconsPlugin } from './iconsPlugin';

export type DefaultThemePluginOptions = {
  icons?: DefaultThemeIconsOptions;
};

export function defaultThemePlugin(
  options: DefaultThemePluginOptions = {}
): Plugin[] {
  return [iconsPlugin(options.icons)];
}
