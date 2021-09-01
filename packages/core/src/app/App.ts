import type { ViteDevServer } from 'vite';

import type { loadModule } from '../utils/module.js';
import type { AppOptions } from './AppOptions.js';
import type { ClientPlugin } from './plugin/ClientPlugin.js';
import type { SiteOptions } from './site/SiteOptions.js';

export type App = {
  /** Plugin extensions. */
  [x: string]: unknown;
  version: string;
  dirs: AppDirs;
  env: AppEnv;
  client: ClientPlugin;
  options: AppOptions;
  site: AppSite;
  context: Record<string, unknown>;
  dev: () => Promise<ViteDevServer>;
  build: () => Promise<void>;
};

export type AppDirs = {
  config: AppDirUtils;
  cwd: AppDirUtils;
  tmp: AppDirUtils;
  src: AppDirUtils;
  out: AppDirUtils;
  public: AppDirUtils;
  theme: AppDirUtils;
};

export type AppDirUtils = {
  loadModule: typeof loadModule;
  read: (filePath: string) => string;
  resolve: (...path: string[]) => string;
  write: (filePath: string, data: string) => void;
};

export type AppEnv = {
  isBuild: boolean;
  isDev: boolean;
  isDebug: boolean;
};

export type AppSite = {
  options: SiteOptions;
};
