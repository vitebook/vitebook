import { path, resolveRelativePath } from '../../utils/path';
import type { AppConfig, AppOptions } from '../AppOptions';

export const createAppOptions = ({
  cliArgs = { command: 'dev', '--': [] },
  root = process.cwd(),
  srcDir = path.resolve(root, 'src'),
  configDir = path.resolve(root, '.vitebook'),
  outDir = path.resolve(configDir, 'dist'),
  tmpDir = path.resolve(configDir, '.temp'),
  cacheDir = path.resolve(configDir, '.cache'),
  publicDir = path.resolve(configDir, 'public'),
  vite = {},
  debug = false,
  include = ['!.vitebook', '!node_modules'],
  plugins = [],
}: AppConfig): AppOptions => {
  const _root = resolveRelativePath(process.cwd(), root);
  const _srcDir = resolveRelativePath(root, srcDir);
  const _configDir = resolveRelativePath(_root, configDir);
  const _cacheDir = resolveRelativePath(_configDir, cacheDir);
  const _publicDir = resolveRelativePath(_configDir, publicDir);

  return {
    cliArgs,
    site: {},
    debug,
    configDir: _configDir,
    root: _root,
    srcDir: _srcDir,
    outDir: resolveRelativePath(_configDir, outDir),
    tmpDir: resolveRelativePath(_configDir, tmpDir),
    cacheDir: _cacheDir,
    publicDir: _publicDir,
    vite: {
      ...vite,
      root: vite.root ?? _root,
      cacheDir: vite.cacheDir ?? _cacheDir,
      publicDir: vite.publicDir ?? _publicDir,
      build: {
        ...vite.build,
        outDir: vite.build?.outDir ?? outDir,
      },
    },
    include,
    plugins,
  };
};
