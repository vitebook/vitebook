import type { App } from '../../App.js';
import type { ThemeInfo } from '../../plugin/Theme.js';
import { resolvePluginsFromConfig } from './resolvePluginsFromConfig.js';
import { resolveTheme } from './resolveTheme.js';
import { resolveThemeLayouts } from './resolveThemeLayouts.js';

/**
 * Resolve theme info and its parent theme info.
 */
export const resolveThemeInfo = async (
  app: App,
  themeName: string
): Promise<ThemeInfo> => {
  const theme = await resolveTheme(app, themeName);

  const themeInfo = {
    layouts: resolveThemeLayouts(theme.layouts),
    plugins: [theme, ...(await resolvePluginsFromConfig(app, theme.plugins))]
  };

  // Return if current theme does not have a parent theme.
  if (!theme.extends) {
    return themeInfo;
  }

  // Resolve parent theme info recursively.
  const parentThemeInfo = await resolveThemeInfo(app, theme.extends);
  return {
    layouts: { ...parentThemeInfo.layouts, ...themeInfo.layouts },
    plugins: [...parentThemeInfo.plugins, ...themeInfo.plugins]
  };
};
