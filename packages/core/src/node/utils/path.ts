import path from 'upath';

import { fs } from './fs';

export { path };

export const resolveRelativePath = (base: string, filePath: string): string =>
  path.isAbsolute(filePath)
    ? filePath
    : path.resolve(
        fs.lstatSync(base).isDirectory() ? base : path.dirname(base),
        filePath,
      );

export const isSubpath = (parent: string, filePath: string): boolean => {
  const relative = path.relative(parent, filePath);
  return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative);
};
