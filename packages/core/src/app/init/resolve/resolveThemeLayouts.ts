import kleur from 'kleur';

import { fs } from '../../../utils/fs.js';
import { formatErrorMsg, logger } from '../../../utils/logger.js';
import { path } from '../../../utils/path.js';
import { isObject } from '../../../utils/unit.js';
import type { ThemePluginObject } from '../../plugin/ThemePlugin.js';

/**
 * Resolve layouts from `layouts` option.
 */
export const resolveThemeLayouts = (
  layouts: ThemePluginObject['layouts'] = {}
): Record<string, string> => {
  if (isObject(layouts)) {
    return layouts;
  }

  if (!fs.pathExistsSync(layouts)) {
    throw logger.createError(
      formatErrorMsg(`layouts directory does not exist: ${kleur.bold(layouts)}`)
    );
  }

  return Object.fromEntries(
    fs
      .readdirSync(layouts)
      .filter((file) => /\.(vue|svelte|ts|tsx|js)$/.test(file))
      .map((file) => [path.trimExt(file), path.resolve(layouts, file)])
  );
};
