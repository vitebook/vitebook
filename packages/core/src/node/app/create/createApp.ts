import { loadConfigFromFile } from 'vite';

import { resolveRelativePath } from '../../utils';
import type { App, AppEnv } from '../App';
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
  const bookConfig = (vite?.config as any).vitebook;

  const bookConfigRoot = config.dirs?.root
    ? `$${config.dirs.root}`
    : '$default';

  const __config = await resolveAppConfig({
    ...config,
    ...(bookConfig?.[bookConfigRoot] ?? bookConfig),
  });

  const dirs = createAppDirs(__config);

  const env = resolveAppEnv({
    ...envConfig,
    isDebug: __config.debug ?? envConfig?.isDebug,
  });

  for (const plugin of __config.plugins.flat() as FilteredPlugins) {
    await plugin.vitebookConfig?.(__config, env);
  }

  const core = corePlugin(__config.core);

  const client = (__config.plugins
    .flat()
    .find((plugin) => plugin && 'entry' in plugin) ?? core) as ClientPlugin;

  const plugins = [
    core,
    ssrPlugin(),
    markdownPlugin(__config.markdown),
    ...__config.plugins.flat(),
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

  const __pages: ResolvedPagesPluginConfig = {
    include: pages.include ?? ['**/*.{svelte,md}'],
    layouts: {
      include: ['**/@layout.{md,svelte}'],
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
    includeNodes: ['**/@markdoc/**/[^_]*.{md,svelte}'],
    transformAst: [],
    transformContent: [],
    transformOutput: [],
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
    plugins,
  };
}

export function resolveAppEnv({ isDebug = false }: Partial<AppEnv>): AppEnv {
  return {
    isDebug,
  };
}
