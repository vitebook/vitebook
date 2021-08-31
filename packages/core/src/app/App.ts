import type { FSWatcher } from 'chokidar';
import type { ViteDevServer } from 'vite';

import type { loadModule } from '../utils/module.js';
import type { AppOptions } from './AppOptions.js';
import type { Markdown, MarkdownOptions } from './markdown/Markdown.js';
import type { Page } from './page/Page.js';
import type { ClientPluginInfo } from './plugin/ClientPlugin.js';
import type { DefaultPluginOptions, Plugin } from './plugin/Plugin.js';
import type { PluginManager } from './plugin/PluginManager.js';
import type { SiteOptions } from './site/SiteOptions.js';

export type App = {
  dirs: AppDirs;
  layouts: Record<string, string>;
  markdown: AppMarkdown;
  env: AppEnv;
  client: ClientPluginInfo;
  options: AppOptions;
  pages: Page[];
  pluginManager: PluginManager;
  site: AppSite;
  version: string;
  watcher: FSWatcher;
  init: () => Promise<void>;
  prepare: () => Promise<void>;
  use: <T extends DefaultPluginOptions>(
    plugin: Plugin<T> | string,
    config?: Partial<T>
  ) => Promise<App>;
  dev: () => Promise<ViteDevServer>;
  build: () => Promise<unknown>;
};

export type AppDirs = {
  cache: AppDirUtils;
  config: AppDirUtils;
  cwd: AppDirUtils;
  tmp: AppDirUtils;
  src: AppDirUtils;
  out: AppDirUtils;
  public: AppDirUtils;
  client: AppDirUtils;
};

export type AppDirUtils = {
  loadModule: typeof loadModule;
  read: (relativeFilePath: string) => string;
  resolve: (...path: string[]) => string;
  write: (relativeFilePath: string, data: string) => void;
};

export type AppEnv = {
  isBuild: boolean;
  isDev: boolean;
  isDebug: boolean;
};

export type AppSite = {
  options: SiteOptions;
};

export type AppMarkdown = {
  parser: Markdown;
  options: MarkdownOptions;
};
