import { globbySync } from 'globby';
import path from 'upath';
import { loadConfigFromFile } from 'vite';

import { installURLPattern, isArray } from '../../../shared';
import { resolveRelativePath } from '../../utils';
import type { App, AppDirs, AppEnv } from '../App';
import type {
  AppConfig,
  ResolvedAppClientConfig,
  ResolvedAppConfig,
  ResolvedRouteConfig,
  ResolvedSitemapConfig,
} from '../AppConfig';
import { build } from '../build';
import { dev } from '../dev';
import { corePlugin, type ResolvedCorePluginConfig } from '../plugins/core';
import {
  markdownPlugin,
  type ResolvedMarkdownPluginConfig,
} from '../plugins/markdown';
import { MarkdocSchema } from '../plugins/markdown/MarkdocSchema';
import {
  Pages,
  pagesPlugin,
  type ResolvedPagesPluginConfig,
} from '../plugins/pages';
import type { FilteredPlugins, Plugin } from '../plugins/Plugin';
import { preview } from '../preview';
import { createAppDirs } from './createAppDirs';
import { DisposalBin } from './DisposalBin';
import { getAppVersion } from './getAppVersion';

export const createApp = async (
  config: AppConfig,
  envConfig?: Partial<AppEnv>,
): Promise<App> => {
  await installURLPattern();

  const version = getAppVersion();

  const vite = await loadConfigFromFile({
    command: config.cliArgs?.command === 'build' ? 'build' : 'serve',
    mode: config.cliArgs?.command === 'dev' ? 'development' : 'production',
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookConfig = (vite?.config as any).vitebook;

  const bookConfigRoot = config.dirs?.root
    ? `$${config.dirs.root}`
    : '$default';

  const __config = await resolveAppConfig({
    ...config,
    ...(bookConfig?.[bookConfigRoot] ?? bookConfig),
  });

  const dirs = createAppDirs(__config);

  const discoveredPlugins = await discoverPlugins(dirs);

  const env = resolveAppEnv({
    ...envConfig,
    isDebug: __config.debug ?? envConfig?.isDebug,
  });

  const userPlugins = [
    ...discoveredPlugins.filter(
      (plugin) => !__config.plugins.find((p) => p.name === plugin.name),
    ),
    ...__config.plugins,
  ];

  for (const plugin of userPlugins) {
    await plugin.vitebookConfig?.(__config, env);
  }

  const core = corePlugin(__config.core);

  const prePlugins = userPlugins.filter(
    (plugin) => plugin.vitebookEnforce === 'pre',
  );
  const normalPlugins = userPlugins.filter((plugin) => !plugin.vitebookEnforce);
  const postPlugins = userPlugins.filter(
    (plugin) => plugin.vitebookEnforce === 'post',
  );

  const plugins = [
    ...prePlugins,
    core,
    markdownPlugin(__config.markdown),
    ...normalPlugins,
    pagesPlugin(__config.pages),
    ...postPlugins,
  ].filter((plugin) => !!plugin) as FilteredPlugins;

  const app: App = {
    version,
    env,
    dirs,
    plugins,
    vite,
    context: new Map(),
    client: core,
    config: __config,
    pages: new Pages(),
    markdoc: new MarkdocSchema(),
    disposal: new DisposalBin(),
    dev: () => dev(app),
    build: () => build(app),
    preview: () => preview(app),
    close: () => app.disposal.empty(),
  };

  for (const plugin of plugins) {
    await plugin.vitebookInit?.(app, env);
  }

  if (!__config.client.app) {
    throw Error(`No client application module was provided.`);
  }

  return app;
};

async function discoverPlugins(dirs: AppDirs) {
  const plugins: Plugin[] = [];

  const packages = globbySync(['node_modules/@vitebook/*/package.json'], {
    cwd: dirs.cwd.path,
    absolute: true,
  });

  for (const pkg of packages) {
    try {
      const nodePath = `${path.dirname(pkg)}/dist/node/index.js`;
      const mod = await import(`${nodePath}`);
      if (typeof mod?.default === 'function') {
        plugins.push(mod.default() as Plugin);
      }
    } catch (e) {
      //  ...
    }
  }

  return plugins;
}

export async function resolveAppConfig({
  cliArgs = { command: 'dev', '--': [] },
  dirs = {},
  debug = false,
  core = {},
  client = {},
  routes = {},
  pages = {},
  markdown = {},
  sitemap,
  plugins = [],
}: AppConfig): Promise<ResolvedAppConfig> {
  const _cwd = resolveRelativePath(process.cwd(), dirs.cwd ?? '.');
  const _root = resolveRelativePath(_cwd, dirs.root ?? '.');
  const _pages = resolveRelativePath(_root, dirs.pages ?? 'pages');
  const _output = resolveRelativePath(_root, dirs.output ?? 'build');
  const _public = resolveRelativePath(_root, dirs.public ?? 'public');

  const __core: ResolvedCorePluginConfig = {
    svelte: {},
    ...core,
  };

  const __client: ResolvedAppClientConfig = {
    app: client.app ? path.relative(_root, client.app) : undefined,
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
    logLevel: 'warn',
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
    cliArgs,
    dirs: {
      cwd: _cwd,
      root: _root,
      pages: _pages,
      output: _output,
      public: _public,
    },
    core: __core,
    client: __client,
    routes: __routes,
    pages: __pages,
    markdown: __markdown,
    sitemap: __sitemap,
    plugins: plugins.flat().filter(Boolean) as FilteredPlugins,
    debug,
  };
}

export function resolveAppEnv({ isDebug = false }: Partial<AppEnv>): AppEnv {
  return {
    isDebug,
  };
}
