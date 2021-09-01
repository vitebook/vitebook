import { path, resolveRelativePathIfNotAbs } from '../../utils/path.js';
import type { AppConfig, AppOptions } from '../AppOptions.js';

export const createAppOptions = ({
  cwd = process.cwd(),
  configDir = path.resolve(cwd, '.vitebook'),
  srcDir = path.resolve(cwd, 'src'),
  outDir = path.resolve(configDir, 'dist'),
  tmpDir = path.resolve(configDir, '.temp'),
  cacheDir = path.resolve(configDir, '.cache'),
  publicDir = path.resolve(configDir, 'public'),
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
