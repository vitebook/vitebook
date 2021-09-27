import path from 'upath';

import { fs } from './fs.js';

export { path };

export const resolveRelativePath = (base: string, filePath: string): string =>
  path.isAbsolute(filePath)
    ? filePath
    : path.resolve(
        fs.lstatSync(base).isDirectory() ? base : path.dirname(base),
        filePath
      );
