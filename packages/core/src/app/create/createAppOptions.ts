import { path, resolveRelativePath } from '../../utils/path.js';
import type { AppConfig, AppOptions } from '../AppOptions.js';

export const createAppOptions = ({
  cliArgs = { command: 'serve', '--': [] },
  cwd = process.cwd(),
  configDir = path.resolve(cwd, '.vitebook'),
  srcDir = path.resolve(cwd, 'src'),
  outDir = path.resolve(configDir, 'dist'),
  tmpDir = path.resolve(configDir, '.temp'),
  cacheDir = path.resolve(configDir, '.cache'),
  publicDir = path.resolve(configDir, 'public'),
  vite = {},
  debug = false,
  pages = ['!.vitebook', '!node_modules'],
  plugins = []
}: AppConfig): AppOptions => {
  const _cwd = resolveRelativePath(process.cwd(), cwd);
  const _configDir = resolveRelativePath(_cwd, configDir);
  const _cacheDir = resolveRelativePath(_configDir, cacheDir);
  const _publicDir = resolveRelativePath(_configDir, publicDir);

  return {
    cliArgs,
    cwd: _cwd,
    site: {},
    debug,
    configDir: _configDir,
    srcDir: resolveRelativePath(_cwd, srcDir),
    outDir: resolveRelativePath(_configDir, outDir),
    tmpDir: resolveRelativePath(_configDir, tmpDir),
    cacheDir: _cacheDir,
    publicDir: _publicDir,
    vite: {
      ...vite,
      cacheDir: vite.cacheDir ?? _cacheDir,
      publicDir: vite.publicDir ?? _publicDir
    },
    pages,
    plugins
  };
};
