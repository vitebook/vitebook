import { fs } from '../../utils/fs';
import {
  loadModule as loadModuleUtil,
  LoadModuleOptions,
} from '../../utils/module';
import { path } from '../../utils/path';
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
    fs.readFileSync(resolve(filePath)).toString();

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
  const tmp = createAppDirUtil(options.tmpDir, options.tmpDir);
  const root = createAppDirUtil(options.root, tmp.path);
  const src = createAppDirUtil(options.srcDir, tmp.path);
  const cache = createAppDirUtil(options.cacheDir, tmp.path);
  const config = createAppDirUtil(options.configDir, tmp.path);
  const out = createAppDirUtil(options.outDir, tmp.path);
  const publicDir = createAppDirUtil(options.publicDir, tmp.path);
  const theme = createAppDirUtil(config.resolve('theme'), tmp.path);

  return {
    root,
    src,
    cache,
    config,
    tmp,
    out,
    theme,
    public: publicDir,
  };
};
