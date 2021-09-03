import { fs } from '../../utils/fs.js';
import { loadModule as loadModuleUtil } from '../../utils/module.js';
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
    options?: { cache?: boolean }
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
  const cwd = createAppDirUtil(options.cwd);
  const cache = createAppDirUtil(options.cacheDir);
  const config = createAppDirUtil(options.configDir);
  const tmp = createAppDirUtil(options.tmpDir);
  const src = createAppDirUtil(options.srcDir);
  const out = createAppDirUtil(options.outDir);
  const publicDir = createAppDirUtil(options.publicDir);
  const theme = createAppDirUtil(config.resolve('theme'));

  return {
    cache,
    config,
    cwd,
    tmp,
    src,
    out,
    theme,
    public: publicDir
  };
};
