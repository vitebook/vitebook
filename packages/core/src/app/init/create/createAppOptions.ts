import { path, resolveRelativePathIfNotAbs } from '../../../utils/path.js';
import type { AppConfig, AppOptions } from '../../AppOptions.js';
import { NO_CLIENT_PLUGIN } from '../../plugin/ClientPlugin.js';

export const createAppOptions = ({
  cwd = process.cwd(),
  configDir = path.resolve(cwd, '.vitebook'),
  srcDir = path.resolve(cwd, 'src'),
  outDir = path.resolve(configDir, 'dist'),
  tmpDir = path.resolve(configDir, '.temp'),
  cacheDir = path.resolve(configDir, '.cache'),
  publicDir = path.resolve(configDir, 'public'),
  // @ts-expect-error - Expects string but we pass a symbol to catch if no client was provided.
  client = [NO_CLIENT_PLUGIN, {}],
  markdown = {},
  vite = {},
  debug = false,
  pages = [
    '**/*.md',
    '**/*.{story,stories}.{js,ts,tsx}',
    '!.vitebook',
    '!node_modules'
  ],
  plugins = []
}: AppConfig): AppOptions => ({
  site: {},
  debug,
  cwd,
  client,
  configDir: resolveRelativePathIfNotAbs(cwd, configDir),
  srcDir: resolveRelativePathIfNotAbs(cwd, srcDir),
  outDir: resolveRelativePathIfNotAbs(configDir, outDir),
  tmpDir: resolveRelativePathIfNotAbs(configDir, tmpDir),
  cacheDir: resolveRelativePathIfNotAbs(configDir, cacheDir),
  publicDir: resolveRelativePathIfNotAbs(configDir, publicDir),
  markdown,
  vite,
  pages,
  plugins
});
