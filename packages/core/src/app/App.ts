import type { ViteDevServer } from 'vite';

import type { loadModule } from '../utils/module.js';
import type { AppOptions } from './AppOptions.js';
import type { DisposalBin } from './create/DisposalBin.js';
import type { ClientPlugin } from './plugin/ClientPlugin.js';
import type { FilteredPlugins } from './plugin/Plugin.js';
import type { ServerPage } from './site/Page.js';
import type { SiteOptions } from './site/SiteOptions.js';

export type App = {
  /** Plugin extensions. */
  [x: string]: unknown;
  version: string;
  configPath?: string;
  themePath: string;
  dirs: AppDirs;
  env: AppEnv;
  client: ClientPlugin;
  options: AppOptions;
  site: AppSite;
  plugins: FilteredPlugins;
  context: Record<string, unknown>;
  pages: ServerPage[];
  disposal: DisposalBin;
  dev: () => Promise<ViteDevServer>;
  build: () => Promise<void>;
  serve: () => Promise<void>;
  close: () => Promise<void>;
};

export type AppDirs = {
  root: AppDirUtils;
  cache: AppDirUtils;
  config: AppDirUtils;
  tmp: AppDirUtils;
  out: AppDirUtils;
  public: AppDirUtils;
  theme: AppDirUtils;
};

export type AppDirUtils = {
  /** Absolute path to directory. */
  path: string;
  /** Transpile with ESBuild and import as an ESM module. */
  loadModule: typeof loadModule;
  /** Read contents of file relative to current directory. */
  read: (filePath: string) => string;
  /** Resolve relative file path to current directory. */
  resolve: (...path: string[]) => string;
  /** Write contents to file relative to current directory. */
  write: (filePath: string, data: string) => void;
};

export type AppEnv = {
  command: 'build' | 'serve';
  isDebug: boolean;
  isDev: boolean;
  isProd: boolean;
  isSSR?: boolean;
  /** @see https://vitejs.dev/guide/env-and-mode.html */
  mode: string;
};

export type AppSite = {
  options: SiteOptions;
};
