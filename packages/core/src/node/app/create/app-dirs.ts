import fs from 'fs';
import path from 'upath';
import { searchForWorkspaceRoot } from 'vite';

import {
  loadModule as loadModuleUtil,
  LoadModuleOptions,
} from '../../utils/module';
import type { AppDirectories, Directory } from '../App';
import type { ResolvedAppConfig } from '../config';

export function createAppDirectories(
  root: string,
  config: ResolvedAppConfig,
): AppDirectories {
  const tmpDir = createDirectory(process.cwd(), 'node_modules/.vitebook/temp');
  const cwdDir = createDirectory(process.cwd(), tmpDir.path);
  const rootDir = createDirectory(root, tmpDir.path);
  const workspaceDir = createDirectory(
    searchForWorkspaceRoot(cwdDir.path, rootDir.path),
    tmpDir.path,
  );
  const appDir = createDirectory(config.dirs.app, tmpDir.path);
  const outDir = createDirectory(config.dirs.output, tmpDir.path);
  const publicDir = createDirectory(config.dirs.public, tmpDir.path);
  return {
    tmp: tmpDir,
    cwd: cwdDir,
    workspace: workspaceDir,
    root: rootDir,
    app: appDir,
    out: outDir,
    public: publicDir,
  };
}

function createDirectory(baseDir: string, tmpDir?: string): Directory {
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
}
