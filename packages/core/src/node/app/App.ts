import type {
  ConfigEnv as ViteConfigEnv,
  ResolvedConfig as ViteResolvedConfig,
  UserConfig as ViteUserConfig,
  ViteDevServer,
} from 'vite';

import type { logger } from '../utils';
import type { loadModule } from '../utils/module';
import type { ResolvedAppConfig } from './config/AppConfig';
import type { DisposalBin } from './create/DisposalBin';
import type { MarkdocSchema } from './plugins/markdown';
import type { Routes } from './plugins/routes';

export type AppDetails = {
  version: string;
  dirs: AppDirectories;
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
  routes: Routes;
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

export type AppDirectories = {
  cwd: Directory;
  root: Directory;
  workspace: Directory;
  routes: Directory;
  tmp: Directory;
  out: Directory;
  public: Directory;
};

export type Directory = {
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
