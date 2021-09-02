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
  return {
    cliArgs,
    cwd: _cwd,
    site: {},
    debug,
    configDir: _configDir,
    srcDir: resolveRelativePath(_cwd, srcDir),
    outDir: resolveRelativePath(_configDir, outDir),
    tmpDir: resolveRelativePath(_configDir, tmpDir),
    cacheDir: resolveRelativePath(_configDir, cacheDir),
    publicDir: resolveRelativePath(_configDir, publicDir),
    vite,
    pages,
    plugins
  };
};
