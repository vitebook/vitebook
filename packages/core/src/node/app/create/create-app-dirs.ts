import fs from 'fs';
import path from 'upath';
import { searchForWorkspaceRoot } from 'vite';

import {
  loadModule as loadModuleUtil,
  LoadModuleOptions,
} from '../../utils/module';
import type { AppDirs, AppDirUtils } from '../App';
import type { ResolvedAppConfig } from '../AppConfig';

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

export const createAppDirs = (
  root: string,
  config: ResolvedAppConfig,
): AppDirs => {
  const tmpDir = createAppDirUtil(process.cwd(), 'node_modules/.vitebook/temp');
  const cwdDir = createAppDirUtil(process.cwd(), tmpDir.path);
  const rootDir = createAppDirUtil(root, tmpDir.path);
  const workspaceDir = createAppDirUtil(
    searchForWorkspaceRoot(cwdDir.path, rootDir.path),
    tmpDir.path,
  );
  const pagesDir = createAppDirUtil(config.dirs.pages, tmpDir.path);
  const outDir = createAppDirUtil(config.dirs.output, tmpDir.path);
  const publicDir = createAppDirUtil(config.dirs.public, tmpDir.path);
  return {
    tmp: tmpDir,
    cwd: cwdDir,
    workspace: workspaceDir,
    root: rootDir,
    pages: pagesDir,
    out: outDir,
    public: publicDir,
  };
};
