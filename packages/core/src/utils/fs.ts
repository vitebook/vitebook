import globby from 'fast-glob';
import * as fsExtra from 'fs-extra';
import hash from 'hash-sum';

// eslint-disable-next-line import/namespace
const fs = fsExtra['default'] as typeof fsExtra;

export { fs, globby, hash };

export const isTypeScriptFile = (filePath: string): boolean =>
  /\.(ts|tsx)$/.test(filePath);

export const isCommonJsFile = (filePath: string): boolean =>
  /\.cjs$/.test(filePath);
