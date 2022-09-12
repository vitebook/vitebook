import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function trimExt(filePath: string) {
  return filePath.substring(0, filePath.lastIndexOf('.')) || filePath;
}

export const resolveRelativePath = (base: string, filePath: string): string => {
  base = normalizePath(base);
  filePath = normalizePath(filePath);
  return path.posix.isAbsolute(filePath)
    ? filePath
    : path.posix.resolve(
        fs.lstatSync(base).isDirectory() ? base : path.posix.dirname(base),
        filePath,
      );
};

export const isSubpath = (parent: string, filePath: string): boolean => {
  const relative = path.posix.relative(parent, filePath);
  return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative);
};

export const isWindows = os.platform() === 'win32';
export function normalizePath(id: string): string {
  return path.posix.normalize(isWindows ? id.replace(/\\/g, '/') : id);
}
