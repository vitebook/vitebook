import path from 'upath';
import {
  ConfigEnv,
  mergeConfig,
  type UserConfig as ViteUserConfig,
} from 'vite';

import {
  installURLPattern,
  isArray,
  type ServerLayout,
  type ServerPage,
} from '../../../shared';
import { logger, resolveRelativePath } from '../../utils';
import type { App, AppDetails, AppFactory } from '../App';
import type {
  AppConfig,
  ResolvedAppClientConfig,
  ResolvedAppConfig,
  ResolvedRouteConfig,
  ResolvedSitemapConfig,
} from '../AppConfig';
import { type ResolvedMarkdownPluginConfig } from '../plugins/markdown';
import { MarkdocSchema } from '../plugins/markdown/MarkdocSchema';
import {
  Pages,
  type ResolvedPagesPluginConfig,
  stripPageInfoFromFilePath,
} from '../plugins/pages';
import type { VitebookPlugin } from '../plugins/Plugin';
import { getAppVersion } from './app-utils';
import { createAppDirs } from './create-app-dirs';
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

  const dirs = createAppDirs(root, resolvedConfig);
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
        pages: new Pages(),
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

function resolveAppConfig(
  root: string,
  {
    dirs = {},
    isDebug: debug = false,
    client = {},
    routes = {},
    pages = {},
    markdown = {},
    sitemap,
  }: AppConfig,
): ResolvedAppConfig {
  const _cwd = path.resolve(process.cwd());
  const _root = resolveRelativePath(_cwd, root);
  const _pages = resolveRelativePath(_root, dirs.pages ?? 'pages');
  const _output = resolveRelativePath(_root, dirs.output ?? 'build');
  const _public = resolveRelativePath(_root, dirs.public ?? 'public');

  const __client: ResolvedAppClientConfig = {
    // Most likely set later by a plugin.
    app: client.app ? path.relative(_root, client.app) : '',
    configFiles: client.configFiles ?? [],
  };

  const __routes: ResolvedRouteConfig = {
    entries: routes.entries ?? [],
    matchers: {
      int: /\d+/,
      str: /\w+/,
      bool: /(true|false|0|1)/,
      ...routes.matchers,
    },
    log: routes.log ?? 'tree',
    logLevel: routes.logLevel ?? 'warn',
  };

  const pageExts = `md,svelte,vue,jsx,tsx`;
  const __pages: ResolvedPagesPluginConfig = {
    include: pages.include ?? [`**/*.{${pageExts}}`],
    exclude: pages.exclude ?? [],
    layouts: {
      include: [
        `**/*@layout.{${pageExts}}`,
        `**/*@layout.reset.{${pageExts}}`,
        `**/@layouts/**/*.{${pageExts}}`,
        `**/@layouts/**/*.reset.{${pageExts}}`,
      ],
      exclude: [],
      ...pages.layouts,
    },
  };

  const __markdown: ResolvedMarkdownPluginConfig = {
    include: markdown.include ?? /\.md($|\?)/,
    exclude: markdown.exclude ?? [],
    markdoc: markdown.markdoc ?? {},
    highlighter: false,
    shiki: { theme: 'material-palenight', langs: [] },
    hastToHtml: {},
    nodes: {
      include: [`**/@markdoc/**/*.{${pageExts}}`],
      exclude: [],
      ...markdown.nodes,
    },
    transformAst: [],
    transformContent: [],
    transformMeta: [],
    transformOutput: [],
    transformTreeNode: [],
    ...markdown,
  };

  const __sitemapConfig: ResolvedSitemapConfig = {
    baseUrl: null,
    filename: 'sitemap.xml',
    changefreq: 'weekly',
    priority: 0.7,
    include: /.*/,
    exclude: null,
    entries: [],
  };

  const __sitemap: ResolvedSitemapConfig[] = (
    isArray(sitemap) ? sitemap : [sitemap]
  )
    .filter(Boolean)
    .map((config) => ({ ...__sitemapConfig, ...config }));

  return {
    isDebug: debug,
    dirs: {
      pages: _pages,
      output: _output,
      public: _public,
    },
    client: __client,
    routes: __routes,
    pages: __pages,
    markdown: __markdown,
    sitemap: __sitemap,
    isBuild: false,
    isSSR: false,
  };
}

function getEntries(app: App) {
  const entries: Record<string, string> = {};

  for (const page of app.pages.all) {
    const filename = buildPageOutputFilename(app, page);
    entries[filename] = page.filePath;
  }

  for (const layout of app.pages.layouts) {
    const filename = buildLayoutOutputFilename(app, layout);
    entries[filename] = layout.filePath;
  }

  return entries;
}

function buildPageOutputFilename(app: App, page: ServerPage) {
  const name = path.trimExt(
    stripPageInfoFromFilePath(app.dirs.pages.relative(page.rootPath)),
  );

  return `pages/${name}`;
}

function buildLayoutOutputFilename(app: App, layout: ServerLayout) {
  const name = path
    .trimExt(app.dirs.pages.relative(layout.rootPath))
    .replace(/@layouts\//, '');

  return `layouts/${name}`;
}
