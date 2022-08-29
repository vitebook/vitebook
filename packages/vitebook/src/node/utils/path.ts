import fs from 'node:fs';
import os from 'os';
import path from 'upath';

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

export const isWindows = os.platform() === 'win32';
export function normalizePath(id: string): string {
  return path.posix.normalize(isWindows ? id.replace(/\\/g, '/') : id);
}
