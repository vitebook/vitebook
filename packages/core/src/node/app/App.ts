import type { PreviewServer, ResolvedConfig, ViteDevServer } from 'vite';

import type { ServerPage, SiteOptions } from '../../shared';
import type { loadModule } from '../utils/module';
import type { AppOptions } from './AppOptions';
import type { DisposalBin } from './create/DisposalBin';
import type { ClientPlugin } from './plugin/ClientPlugin';
import type { FilteredPlugins } from './plugin/Plugin';

export type App = {
  /** Plugin extensions. */
  [x: string]: unknown;
  version: string;
  configPath?: string;
  dirs: AppDirs;
  env: AppEnv;
  client: ClientPlugin;
  options: AppOptions;
  site: AppSite;
  vite: ResolvedConfig;
  plugins: FilteredPlugins;
  context: Record<string, unknown>;
  pages: ServerPage[];
  disposal: DisposalBin;
  dev: () => Promise<ViteDevServer>;
  build: () => Promise<void>;
  preview: () => Promise<PreviewServer>;
  close: () => Promise<void>;
  hasPlugin: (name: string) => boolean;
};

export type AppDirs = {
  root: AppDirUtils;
  src: AppDirUtils;
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
  /** Resolve file path relative to current directory. */
  resolve: (...path: string[]) => string;
  /** Resolve relative file path to current directory. */
  relative: (...path: string[]) => string;
  /** Write contents to file relative to current directory. */
  write: (filePath: string, data: string) => void;
};

export type AppEnv = {
  command: 'dev' | 'build' | 'preview';
  isDebug: boolean;
  isDev: boolean;
  isProd: boolean;
  /** @see https://vitejs.dev/guide/env-and-mode.html */
  mode?: string;
};

export type AppSite = {
  options: SiteOptions;
};
