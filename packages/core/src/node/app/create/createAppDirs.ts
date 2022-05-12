import fs from 'fs';
import path from 'upath';

import {
  loadModule as loadModuleUtil,
  LoadModuleOptions,
} from '../../utils/module';
import type { AppDirs, AppDirUtils } from '../App';
import type { AppOptions } from '../AppOptions';

export const createAppDirUtil = (
  baseDir: string,
  tmpDir?: string,
): AppDirUtils => {
  const resolve = (...args: string[]) =>
    args.length === 1 && path.isAbsolute(args[0])
      ? args[0]
      : path.resolve(baseDir, ...args);

  const relative = (...args: string[]) =>
    path.relative(baseDir, path.join(...args));

  const read = (filePath: string) =>
    fs.readFileSync(resolve(filePath), 'utf-8');

  const write = (filePath: string, data: string) =>
    fs.writeFileSync(resolve(filePath), data);

  const loadModule = async <T>(
    filePath: string,
    options?: LoadModuleOptions,
  ): Promise<T> => {
    const path = resolve(filePath);
    return loadModuleUtil<T>(path, { outdir: tmpDir, ...options });
  };

  return {
    path: baseDir,
    resolve,
    relative,
    read,
    write,
    loadModule,
  };
};

export const createAppDirs = (options: AppOptions): AppDirs => {
  const tmp = createAppDirUtil(process.cwd(), 'node_modules/.vitebook/temp');
  const cwd = createAppDirUtil(options.dirs.cwd, tmp.path);
  const root = createAppDirUtil(options.dirs.root, tmp.path);
  const pages = createAppDirUtil(options.dirs.pages, tmp.path);
  const out = createAppDirUtil(options.dirs.output, tmp.path);
  const publicDir = createAppDirUtil(options.dirs.public, tmp.path);

  return {
    tmp,
    cwd,
    root,
    pages,
    out,
    public: publicDir,
  };
};
