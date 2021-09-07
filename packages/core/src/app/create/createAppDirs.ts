import { fs } from '../../utils/fs.js';
import {
  loadModule as loadModuleUtil,
  LoadModuleOptions
} from '../../utils/module.js';
import { path } from '../../utils/path.js';
import type { AppDirs, AppDirUtils } from '../App.js';
import type { AppOptions } from '../AppOptions.js';

export const createAppDirUtil = (baseDir: string): AppDirUtils => {
  const resolve = (...args: string[]) =>
    args.length === 1 && path.isAbsolute(args[0])
      ? args[0]
      : path.resolve(baseDir, ...args);

  const read = (filePath: string) =>
    fs.readFileSync(resolve(filePath)).toString();

  const write = (filePath: string, data: string) =>
    fs.writeFileSync(resolve(filePath), data);

  const loadModule = async <T>(
    filePath: string,
    options?: LoadModuleOptions
  ): Promise<T> => {
    const path = resolve(filePath);
    return loadModuleUtil<T>(path, options);
  };

  return {
    path: baseDir,
    resolve,
    read,
    write,
    loadModule
  };
};

export const createAppDirs = (options: AppOptions): AppDirs => {
  const root = createAppDirUtil(options.root);
  const cache = createAppDirUtil(options.cacheDir);
  const config = createAppDirUtil(options.configDir);
  const tmp = createAppDirUtil(options.tmpDir);
  const out = createAppDirUtil(options.outDir);
  const publicDir = createAppDirUtil(options.publicDir);
  const theme = createAppDirUtil(config.resolve('theme'));

  return {
    root,
    cache,
    config,
    tmp,
    out,
    theme,
    public: publicDir
  };
};
