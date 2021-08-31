import type { FSWatcher } from 'chokidar';
import type { ViteDevServer } from 'vite';

import type { AppOptions } from './AppOptions.js';
import type { Markdown, MarkdownOptions } from './markdown/Markdown.js';
import type { Page } from './page/Page.js';
import type { PluginManager } from './plugin/PluginManager.js';
import type { SiteOptions } from './site/SiteOptions.js';

export type App = {
  dirs: AppDirs;
  layouts: Record<string, string>;
  markdown: AppMarkdown;
  env: AppEnv;
  options: AppOptions;
  pages: Page[];
  pluginManager: PluginManager;
  site: AppSite;
  version: string;
  watcher: FSWatcher;
  init: () => Promise<void>;
  prepare: () => Promise<void>;
  dev: () => Promise<ViteDevServer>;
  build: () => Promise<unknown>;
  close(): Promise<void>;
};

export type AppDirs = {
  cache: AppDir;
  temp: AppDir;
  source: AppDir;
  dest: AppDir;
  public: AppDir;
  client: AppDir;
};

export type AppDir = {
  loadModule: <T>(...path: string[]) => Promise<T>;
  read: (filePath: string) => Promise<string>;
  resolve: (...path: string[]) => string;
  write: (filePath: string, contents: string) => Promise<void>;
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
