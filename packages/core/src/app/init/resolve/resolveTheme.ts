import kleur from 'kleur';

import { formatErrorMsg, logger } from '../../../utils/logger.js';
import { requireResolve } from '../../../utils/module.js';
import { path } from '../../../utils/path.js';
import { normalizePackageName } from '../../../utils/pkg.js';
import type { App } from '../../App.js';
import type { ThemeConfig, ThemeObject } from '../../plugin/Theme.js';
import { resolvePlugin } from './resolvePlugin.js';

/**
 * Resolve a theme according to the theme name.
 */
export const resolveTheme = async (
  app: App,
  themeName: string
): Promise<ThemeObject> => {
  const themeEntry = requireResolve(
    path.isAbsolute(themeName)
      ? themeName
      : normalizePackageName(themeName, 'vitebook', 'theme')
  );

  if (themeEntry === null) {
    throw logger.createError(
      formatErrorMsg(`theme is not found: ${kleur.bold(themeName)}`)
    );
  }

  const theme = await resolvePlugin<ThemeConfig, ThemeObject>(
    app,
    themeEntry,
    app.site.options.themeConfig
  );

  return theme;
};
