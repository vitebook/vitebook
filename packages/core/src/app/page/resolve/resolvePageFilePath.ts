import kleur from 'kleur';

import { formatErrorMsg, logger } from '../../../utils/logger.js';
import { path } from '../../../utils/path.js';
import type { App } from '../../App.js';
import type { PageOptions } from '../Page.js';

/**
 * Resolve absolute and relative path of page file.
 */
export const resolvePageFilePath = ({
  app,
  options: { filePath }
}: {
  app: App;
  options: PageOptions;
}): {
  filePath: string | null;
  filePathRelative: string | null;
} => {
  // Empty file path.
  if (!filePath) {
    return {
      filePath: null,
      filePathRelative: null
    };
  }

  if (!path.isAbsolute(filePath)) {
    throw logger.createError(
      formatErrorMsg(`filePath is not absolute: ${kleur.bold(filePath)}}`)
    );
  }

  return {
    filePath,
    filePathRelative: path.relative(app.dirs.src.resolve(), filePath)
  };
};
