import type { loadConfigFromFile, PreviewServer, ViteDevServer } from 'vite';

import type { loadModule } from '../utils/module';
import type { ResolvedAppConfig } from './AppConfig';
import type { DisposalBin } from './create/DisposalBin';
import type { ClientPlugin } from './plugins/ClientPlugin';
import type { MarkdocSchema } from './plugins/markdown/MarkdocSchema';
import type { Pages } from './plugins/pages';
import type { FilteredPlugins } from './plugins/Plugin';

export type App = {
  /** Plugin extensions. */
  [x: string]: unknown;
  version: string;
  dirs: AppDirs;
  env: AppEnv;
  client: ClientPlugin;
  config: ResolvedAppConfig;
  plugins: FilteredPlugins;
  context: Record<string, unknown>;
  pages: Pages;
  markdoc: MarkdocSchema;
  disposal: DisposalBin;
  vite: Awaited<ReturnType<typeof loadConfigFromFile>>;
  dev: () => Promise<ViteDevServer>;
  build: () => Promise<void>;
  preview: () => Promise<PreviewServer>;
  close: () => Promise<void>;
};

export type AppDirs = {
  cwd: AppDirUtils;
  root: AppDirUtils;
  pages: AppDirUtils;
  tmp: AppDirUtils;
  out: AppDirUtils;
  public: AppDirUtils;
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
  isDebug: boolean;
};

export { DisposalBin };
