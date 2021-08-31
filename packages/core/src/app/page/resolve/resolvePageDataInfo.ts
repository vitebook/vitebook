import { path } from '../../../utils/path.js';
import type { App } from '../../App.js';

/**
 * Resolve page data file path.
 */
export const resolvePageDataInfo = ({
  app,
  htmlFilePathRelative
}: {
  app: App;
  htmlFilePathRelative: string;
}): {
  dataFilePath: string;
  dataFilePathRelative: string;
} => {
  const dataFilePathRelative = path.join('pages', `${htmlFilePathRelative}.js`);
  const dataFilePath = app.dirs.tmp.resolve(dataFilePathRelative);

  return {
    dataFilePath,
    dataFilePathRelative
  };
};
