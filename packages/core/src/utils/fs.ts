import * as globby from 'fast-glob';
import hash from 'hash-sum';

export { globby, hash };

export * as fs from 'fs-extra';

export const isTypeScriptFile = (filePath: string): boolean =>
  /\.(ts|tsx)$/.test(filePath);
