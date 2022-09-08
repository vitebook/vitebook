import { createAutoBuildAdapter } from 'node/build/adapter';
import { normalizePath, resolveRelativePath } from 'node/utils';
import path from 'node:path';
import { isArray } from 'shared/utils/unit';

import type { ResolvedBuildConfig } from '.';
import type { AppConfig, ResolvedAppConfig } from './AppConfig';
import type { ResolvedClientConfig } from './ClientConfig';
import type { ResolvedMarkdownConfig } from './MarkdownConfig';
import type { ResolvedRoutesConfig } from './RoutesConfig';
import type { ResolvedSitemapConfig } from './SitemapConfig';

export function resolveAppConfig(
  root: string,
  {
    build = {},
    dirs = {},
    debug: isDebug = !!process.env.DEBUG,
    entry = { client: '', server: '' },
    client = {},
    routes = {},
    markdown = {},
    sitemap,
  }: AppConfig,
): ResolvedAppConfig {
  const _cwd = normalizePath(process.cwd());
  const _root = resolveRelativePath(_cwd, root);
  const _app = resolveRelativePath(_root, dirs.app ?? 'app');
  const _public = resolveRelativePath(_app, dirs.public ?? 'public');
  const _output = resolveRelativePath(_root, dirs.build ?? 'build');

  const __build: ResolvedBuildConfig = {
    adapter: build.adapter ?? createAutoBuildAdapter(),
  };

  const __client: ResolvedClientConfig = {
    // Most likely set later by a plugin.
    app: client.app
      ? path.posix.relative(_root, normalizePath(client.app))
      : '',
  };

  const pageExts = `md,svelte,vue,jsx,tsx`;
  const endpointExts = 'js,ts';

  const __routes: ResolvedRoutesConfig = {
    entries: routes.entries ?? [],
    matchers: [
      ...(routes.matchers ?? []),
      { name: 'int', matcher: /\d+/ },
      { name: 'str', matcher: /\w+/ },
      { name: 'bool', matcher: /(true|false)/ },
      (route) => route.replace(/\[\[\.\.\.(.*?)\]\]/g, ':$1*'),
      (route) => route.replace(/\[\.\.\.(.*?)\]/g, ':$1+'),
      (route) => route.replace(/\[(.*?)\]/g, ':$1'),
    ],
    log: routes.log ?? 'tree',
    logLevel: routes.logLevel ?? 'warn',
    pages: {
      include: [`**/+page.{${pageExts}}`],
      exclude: [],
      ...routes.pages,
    },
    layouts: {
      include: [`**/+layout*.{${pageExts}}`],
      exclude: [],
      ...routes.pages,
    },
    errors: {
      include: [`**/+error.{${pageExts}}`],
      exclude: [],
      ...routes.errors,
    },
    endpoints: {
      include: [`**/+http.{${endpointExts}}`],
      exclude: [],
      ...routes.endpoints,
    },
  };

  const __markdown: ResolvedMarkdownConfig = {
    include: markdown.include ?? /\.md($|\?)/,
    exclude: markdown.exclude ?? [],
    markdoc: markdown.markdoc ?? {},
    highlighter: false,
    shiki: { theme: 'material-palenight', langs: [] },
    hastToHtml: {},
    nodes: {
      include: [`**/.markdoc/**/*.{${pageExts}}`],
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
    origin: null,
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
    build: __build,
    dirs: {
      app: _app,
      build: _output,
      public: _public,
    },
    entry,
    client: __client,
    routes: __routes,
    markdown: __markdown,
    sitemap: __sitemap,
    isBuild: false,
    isSSR: false,
    debug: isDebug,
  };
}
