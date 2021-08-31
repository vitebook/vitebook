import kleur from 'kleur';

import { fs } from '../../../utils/fs.js';
import { formatErrorMsg, logger } from '../../../utils/logger.js';
import { path } from '../../../utils/path.js';
import { isObject } from '../../../utils/unit.js';
import type { ThemeObject } from '../../plugin/Theme.js';

/**
 * Resolve layouts from `layouts` option.
 */
export const resolveThemeLayouts = (
  layouts: ThemeObject['layouts'] = {}
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
      // TODO(CLIENT-PLUGIN): accepted ext's should be determined by client plugin.
      .filter((file) => /\.(vue|svelte|ts|tsx|js)$/.test(file))
      .map((file) => [path.trimExt(file), path.resolve(layouts, file)])
  );
};
