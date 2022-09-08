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
import {
  AppFiles,
  type EndpointFile,
  type ErrorFile,
  type LayoutFile,
  type PageFile,
} from '../files';
import { AppRoutes } from '../routes';
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
        files: new AppFiles(),
        routes: new AppRoutes(),
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

  for (const page of app.files.pages) {
    const filename = resolvePageOutputFilename(app, page);
    entries[filename] = page.path;
  }

  for (const error of app.files.errors) {
    const filename = resolveErrorOutputFilename(app, error);
    entries[filename] = error.path;
  }

  for (const layout of app.files.layouts) {
    const filename = resolveLayoutOutputFilename(app, layout);
    entries[filename] = layout.path;
  }

  if (isSSR || app.config.isSSR) {
    for (const endpoint of app.files.endpoints) {
      const filename = resolveEndpointFilename(app, endpoint);
      entries[filename] = endpoint.path;
    }
  }

  return entries;
}

function resolvePageOutputFilename(app: App, page: PageFile) {
  const name = trimExt(app.dirs.app.relative(page.rootPath));
  return `pages/${name}`;
}

function resolveErrorOutputFilename(app: App, error: ErrorFile) {
  const name = trimExt(app.dirs.app.relative(error.rootPath));
  return `errors/${name}`;
}

function resolveLayoutOutputFilename(app: App, layout: LayoutFile) {
  const name = trimExt(app.dirs.app.relative(layout.rootPath));
  return `layouts/${name}`;
}

function resolveEndpointFilename(app: App, endpoint: EndpointFile) {
  // /api/...
  return trimExt(app.dirs.app.relative(endpoint.rootPath));
}
