import { loadConfigFromFile } from 'vite';

import { resolveRelativePath } from '../../utils';
import type { App, AppEnv } from '../App';
import type { AppConfig, AppOptions } from '../AppOptions';
import { build } from '../build';
import { dev } from '../dev';
import type { ClientPlugin } from '../plugins/ClientPlugin';
import { corePlugin } from '../plugins/core';
import { markdownPlugin } from '../plugins/markdown';
import { Pages, pagesPlugin } from '../plugins/pages';
import type { FilteredPlugins } from '../plugins/Plugin';
import { ssrPlugin } from '../plugins/ssr';
import { preview } from '../preview';
import { createAppDirs } from './createAppDirs';
import { DisposalBin } from './DisposalBin';
import { getAppVersion } from './getAppVersion';

export const createApp = async (
  config: AppConfig,
  envConfig?: Partial<AppEnv>,
): Promise<App> => {
  const version = getAppVersion();

  const vite = await loadConfigFromFile({
    command: config.cliArgs?.command === 'build' ? 'build' : 'serve',
    mode: config.cliArgs?.command === 'dev' ? 'development' : 'production',
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookConfig = (vite?.config as any).book;

  const bookConfigRoot = config.dirs?.root
    ? `$${config.dirs.root}`
    : '$default';

  const options = createAppOptions({
    ...config,
    ...(bookConfig?.[bookConfigRoot] ?? bookConfig),
  });

  const dirs = createAppDirs(options);

  const env = createAppEnv({
    ...envConfig,
    isDebug: options.debug ?? envConfig?.isDebug,
  });

  const core = corePlugin(options.core);

  const client = (options.plugins
    .flat()
    .find((plugin) => plugin && 'entry' in plugin) ?? core) as ClientPlugin;

  const plugins = [
    core,
    ssrPlugin(),
    markdownPlugin(),
    ...options.plugins.flat(),
    pagesPlugin(),
  ].filter((plugin) => !!plugin) as FilteredPlugins;

  const app: App = {
    version,
    options,
    env,
    dirs,
    plugins,
    vite,
    pages: new Pages(),
    context: {},
    client,
    disposal: new DisposalBin(),
    dev: () => dev(app),
    build: () => build(app),
    preview: () => preview(app),
    close: () => app.disposal.empty(),
  };

  for (const plugin of plugins) {
    await plugin.configureApp?.(app, env);
  }

  await app.pages.init({
    dirs: {
      root: dirs.root.path,
      pages: dirs.pages.path,
    },
    include: {
      pages: options.pages.include ?? [],
      layouts: options.pages.layouts?.include ?? [],
    },
  });

  await app.pages.discover();

  return app;
};

export function createAppOptions({
  cliArgs = { command: 'dev', '--': [] },
  dirs = {},
  debug = false,
  core = {},
  pages = {},
  markdown = {},
  plugins = [],
}: AppConfig): AppOptions {
  const _cwd = resolveRelativePath(process.cwd(), dirs.cwd ?? '.');
  const _root = resolveRelativePath(_cwd, dirs.root ?? '.');
  const _pages = resolveRelativePath(_root, dirs.pages ?? 'pages');
  const _output = resolveRelativePath(_root, dirs.output ?? 'build');
  const _public = resolveRelativePath(_root, dirs.public ?? 'public');

  return {
    cliArgs,
    debug,
    dirs: {
      cwd: _cwd,
      root: _root,
      pages: _pages,
      output: _output,
      public: _public,
    },
    core,
    pages,
    markdown,
    plugins,
  };
}

export function createAppEnv({ isDebug = false }: Partial<AppEnv>): AppEnv {
  return {
    isDebug,
  };
}
