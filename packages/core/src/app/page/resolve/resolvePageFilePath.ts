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

  // Absolute file path.
  if (path.isAbsolute(filePath)) {
    return {
      filePath,
      filePathRelative: path.relative(app.dirs.src.resolve(), filePath)
    };
  }

  // Relative file path.
  return {
    filePath: app.dirs.src.resolve(filePath),
    filePathRelative: filePath
  };
};
