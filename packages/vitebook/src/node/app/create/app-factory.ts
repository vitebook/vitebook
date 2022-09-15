import kleur from 'kleur';
import { MarkdocSchema } from 'node/markdoc/MarkdocSchema';
import { logger, normalizePath, trimExt } from 'node/utils';
import type { VitebookPlugin } from 'node/vite/Plugin';
import { installURLPattern } from 'shared/polyfills';
import {
  type ConfigEnv,
  mergeConfig,
  type UserConfig as ViteUserConfig,
} from 'vite';

import type { App, AppDetails, AppFactory } from '../App';
import {
  type AppConfig,
  resolveAppConfig,
  type ResolvedAppConfig,
} from '../config';
import { Files } from '../files';
import { Routes } from '../routes';
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

  const details: AppDetails = {
    version,
    dirs,
    config: { ...resolvedConfig },
    vite: { env },
  };

  const app: AppFactory = {
    ...details,
    create: async () => {
      const $app: App = {
        ...details,
        logger,
        vite: { user: viteConfig, env },
        context: new Map(),
        files: new Files(),
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

      if (!$app.config.entry.client || !$app.config.entry.server) {
        const frameworkPlugins = ['@vitebook/svelte']
          .map((fw) => kleur.cyan(`- npm i ${fw}`))
          .join('\n');

        throw Error(
          [
            kleur.red(`Missing client/server entries.`),
            kleur.bold(
              "\n1. Make sure you've installed a framework-specific plugin:",
            ),
            `\n${frameworkPlugins}`,
            kleur.bold(
              "\n2. Next, check if you've added the plugin to `vite.config.*`.",
            ),
            '',
          ].join('\n'),
        );
      }

      app.config.entry.client = normalizePath(app.config.entry.client);
      app.config.entry.server = normalizePath(app.config.entry.server);

      for (const plugin of plugins) {
        await plugin.vitebook?.configureApp?.($app);
      }

      return $app;
    },
  };

  return app;
};

export function createAppEntries(app: App, { isSSR = false } = {}) {
  const entries: Record<string, string> = {};

  const nodes = [
    ...app.files.layouts.toArray(),
    ...app.files.errors.toArray(),
    ...app.files.pages.toArray(),
    ...(isSSR || app.config.isSSR ? app.files.endpoints.toArray() : []),
  ];

  for (const node of nodes) {
    const name = trimExt(node.rootPath);
    entries[`nodes/${name}`] = node.path;
  }

  return entries;
}
