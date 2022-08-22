import path from 'upath';
import {
  ConfigEnv,
  mergeConfig,
  type UserConfig as ViteUserConfig,
} from 'vite';

import {
  installURLPattern,
  type ServerLayout,
  type ServerPage,
} from '../../../shared';
import { logger } from '../../utils';
import type { App, AppDetails, AppFactory } from '../App';
import {
  type AppConfig,
  resolveAppConfig,
  type ResolvedAppConfig,
} from '../config';
import { MarkdocSchema } from '../plugins/markdown/MarkdocSchema';
import type { VitebookPlugin } from '../plugins/Plugin';
import { Routes } from '../plugins/routes';
import { createAppDirectories } from './app-dirs';
import { getAppVersion } from './app-utils';
import { DisposalBin } from './DisposalBin';

export const createAppFactory = async (
  config: AppConfig,
  viteConfig: ViteUserConfig,
  env: ConfigEnv,
): Promise<AppFactory> => {
  await installURLPattern();

  const root = viteConfig.root ?? process.cwd();

  const resolvedConfig = resolveAppConfig(root, config);
  resolvedConfig.isBuild = env.command === 'build';
  resolvedConfig.isSSR = !!viteConfig.build?.ssr;

  const dirs = createAppDirectories(root, resolvedConfig);
  const version = getAppVersion();

  let plugins = viteConfig
    .plugins!.flat()
    .filter((plugin) => plugin && 'vitebook' in plugin) as VitebookPlugin[];

  plugins = [
    ...plugins.filter((plugin) => plugin.enforce === 'pre'),
    ...plugins.filter((plugin) => !plugin.enforce),
    ...plugins.filter((plugin) => plugin.enforce === 'post'),
  ];

  const entry =
    plugins.find((plugin) => plugin.vitebook?.entry)?.vitebook!.entry ??
    defaultEntry();

  const details: AppDetails = {
    version,
    dirs,
    entry,
    config: { ...resolvedConfig },
    vite: { env },
  };

  const app: AppFactory = {
    ...details,
    create: async () => {
      const $app: App = {
        ...details,
        logger,
        entries: (() => {
          let cached: Record<string, string>;
          return () => (cached ??= getEntries($app));
        })(),
        vite: { user: viteConfig, env },
        context: new Map(),
        routes: new Routes(),
        markdoc: new MarkdocSchema(),
        disposal: new DisposalBin(),
        destroy: () => $app.disposal.empty(),
      };

      for (const plugin of plugins) {
        const overrides = await plugin.vitebook!.config?.($app.config);
        if (overrides) {
          $app.config = mergeConfig(
            $app.config,
            overrides,
          ) as ResolvedAppConfig;
        }
      }

      for (const plugin of plugins) {
        await plugin.vitebook?.configureApp?.($app);
      }

      return $app;
    },
  };

  return app;
};

function defaultEntry(): App['entry'] {
  return {
    client: require.resolve(`@vitebook/core/entry-client.js`),
    server: require.resolve(`@vitebook/core/entry-server.js`),
  };
}

function getEntries(app: App) {
  const entries: Record<string, string> = {};

  for (const page of app.routes.pages) {
    const filename = buildPageOutputFilename(app, page);
    entries[filename] = page.filePath;
  }

  for (const layout of app.routes.layouts) {
    const filename = buildLayoutOutputFilename(app, layout);
    entries[filename] = layout.filePath;
  }

  return entries;
}

function buildPageOutputFilename(app: App, page: ServerPage) {
  const name = path.trimExt(app.dirs.app.relative(page.rootPath));
  return `pages/${name}`;
}

function buildLayoutOutputFilename(app: App, layout: ServerLayout) {
  const name = path
    .trimExt(app.dirs.app.relative(layout.rootPath))
    .replace(/@layouts\//, '');

  return `layouts/${name}`;
}
