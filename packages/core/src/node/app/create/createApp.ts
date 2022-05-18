import { globbySync } from 'globby';
import kleur from 'kleur';
import path from 'upath';
import { loadConfigFromFile } from 'vite';

import { logger, resolveRelativePath } from '../../utils';
import type { App, AppDirs, AppEnv } from '../App';
import type { AppConfig, ResolvedAppConfig } from '../AppConfig';
import { build } from '../build';
import { dev } from '../dev';
import type { ClientPlugin } from '../plugins/ClientPlugin';
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

  const client = userPlugins
    .flat()
    .find((plugin) => plugin && 'entry' in plugin) as ClientPlugin;

  if (!client) {
    logger.error(
      logger.formatErrorMsg(
        `Failed to find client plugin. You might not have installed a client package.\n\n${kleur.bold(
          'npm install @vitebook/svelte',
        )}`,
      ),
    );

    throw Error();
  }

  const plugins = [
    core,
    markdownPlugin(__config.markdown),
    ...userPlugins,
    pagesPlugin(__config.pages),
  ].filter((plugin) => !!plugin) as FilteredPlugins;

  const app: App = {
    version,
    env,
    dirs,
    plugins,
    vite,
    context: {},
    client,
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
  pages = {},
  markdown = {},
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

  const pageExts = `md,svelte,vue,jsx,tsx`;

  const __pages: ResolvedPagesPluginConfig = {
    include: pages.include ?? [`**/*.{${pageExts}}`],
    exclude: pages.exclude ?? [],
    layouts: {
      include: [`**/@layout.{${pageExts}}`, `**/@layouts/**/*.{${pageExts}}`],
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
    includeNodes: [`**/@markdoc/**/*.{${pageExts}}`],
    transformAst: [],
    transformContent: [],
    transformOutput: [],
    transformTreeNode: [],
    ...markdown,
  };

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
    core: __core,
    pages: __pages,
    markdown: __markdown,
    plugins: plugins.flat().filter(Boolean) as FilteredPlugins,
  };
}

export function resolveAppEnv({ isDebug = false }: Partial<AppEnv>): AppEnv {
  return {
    isDebug,
  };
}
