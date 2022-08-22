import type {
  ConfigEnv as ViteConfigEnv,
  ResolvedConfig as ViteResolvedConfig,
  UserConfig as ViteUserConfig,
  ViteDevServer,
} from 'vite';

import type { logger } from '../utils';
import type { loadModule } from '../utils/module';
import type { ResolvedAppConfig } from './AppConfig';
import type { DisposalBin } from './create/DisposalBin';
import type { MarkdocSchema } from './plugins/markdown';
import type { Pages } from './plugins/pages';

export type AppDetails = {
  version: string;
  dirs: AppDirs;
  entry: {
    client: string;
    server: string;
  };
  vite: {
    env: ViteConfigEnv;
  };
  config: ResolvedAppConfig;
};

export type AppFactory = AppDetails & {
  create: () => Promise<App>;
};

export type App = AppDetails & {
  /** Plugin extensions. */
  [x: string]: unknown;
  entries: () => Record<string, string>;
  context: Map<string, unknown>;
  pages: Pages;
  markdoc: MarkdocSchema;
  disposal: DisposalBin;
  logger: typeof logger;
  vite: {
    env: ViteConfigEnv;
    user: ViteUserConfig;
    /** Available after core plugin `configResolved` hook runs. */
    resolved?: ViteResolvedConfig;
    /** Available during dev mode after core plugin `configureServer` hook runs. */
    server?: ViteDevServer;
  };
  destroy: () => void;
};

export type AppDirs = {
  cwd: AppDirUtils;
  root: AppDirUtils;
  workspace: AppDirUtils;
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

export { DisposalBin };
