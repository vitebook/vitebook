import type {
  ConfigEnv as ViteConfigEnv,
  ResolvedConfig as ViteResolvedConfig,
  UserConfig as ViteUserConfig,
  ViteDevServer,
} from 'vite';

import type { logger } from '../utils';
import type { ResolvedAppConfig } from './config/AppConfig';
import type { DisposalBin } from './create/DisposalBin';
import type { MarkdocSchema } from './markdoc';
import type { AppNodes } from './nodes';

export type AppDetails = {
  version: string;
  dirs: AppDirectories;
  vite: { env: ViteConfigEnv };
  config: ResolvedAppConfig;
};

export type AppFactory = AppDetails & {
  create: () => Promise<App>;
};

export type App = AppDetails & {
  /** Plugin extensions. */
  [x: string]: unknown;
  context: Map<string, unknown>;
  nodes: AppNodes;
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
  app: Directory;
  tmp: Directory;
  build: Directory;
  client: Directory;
  server: Directory;
  public: Directory;
};

export type Directory = {
  /** Absolute path to directory. */
  path: string;
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
