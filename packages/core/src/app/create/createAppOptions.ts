import { path, resolveRelativePath } from '../../utils/path.js';
import type { AppConfig, AppOptions } from '../AppOptions.js';

export const createAppOptions = ({
  cliArgs = { command: 'serve', '--': [] },
  root = process.cwd(),
  configDir = path.resolve(root, '.vitebook'),
  outDir = path.resolve(configDir, 'dist'),
  tmpDir = path.resolve(configDir, '.temp'),
  cacheDir = path.resolve(configDir, '.cache'),
  publicDir = path.resolve(configDir, 'public'),
  vite = {},
  debug = false,
  include = ['!.vitebook', '!node_modules'],
  plugins = []
}: AppConfig): AppOptions => {
  const _root = resolveRelativePath(process.cwd(), root);
  const _configDir = resolveRelativePath(_root, configDir);
  const _cacheDir = resolveRelativePath(_configDir, cacheDir);
  const _publicDir = resolveRelativePath(_configDir, publicDir);

  return {
    cliArgs,
    site: {},
    debug,
    configDir: _configDir,
    root: _root,
    outDir: resolveRelativePath(_configDir, outDir),
    tmpDir: resolveRelativePath(_configDir, tmpDir),
    cacheDir: _cacheDir,
    publicDir: _publicDir,
    vite: {
      ...vite,
      cacheDir: vite.cacheDir ?? _cacheDir,
      publicDir: vite.publicDir ?? _publicDir
    },
    include,
    plugins
  };
};
