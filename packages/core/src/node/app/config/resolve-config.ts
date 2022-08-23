import path from 'upath';

import { isArray } from '../../../shared';
import { resolveRelativePath } from '../../utils';
import type { AppConfig, ResolvedAppConfig } from './AppConfig';
import type { ResolvedClientConfig } from './ClientConfig';
import type { ResolvedMarkdownConfig } from './MarkdownConfig';
import type { ResolvedRoutesConfig } from './RoutesConfig';
import type { ResolvedSitemapConfig } from './SitemapConfig';

export function resolveAppConfig(
  root: string,
  {
    dirs = {},
    isDebug: debug = false,
    client = {},
    routes = {},
    markdown = {},
    sitemap,
  }: AppConfig,
): ResolvedAppConfig {
  const _cwd = path.resolve(process.cwd());
  const _root = resolveRelativePath(_cwd, root);
  const _app = resolveRelativePath(_root, dirs.app ?? 'app');
  const _output = resolveRelativePath(_root, dirs.output ?? 'build');
  const _public = resolveRelativePath(_root, dirs.public ?? 'public');

  const __client: ResolvedClientConfig = {
    // Most likely set later by a plugin.
    app: client.app ? path.relative(_root, client.app) : '',
    configFiles: client.configFiles ?? [],
  };

  const pageExts = `md,svelte,vue,jsx,tsx`;
  const fnExts = 'js,ts';

  const __routes: ResolvedRoutesConfig = {
    entries: routes.entries ?? [],
    matchers: {
      int: /:slug(\d+)/,
      str: /:slug(\w+)/,
      bool: /:slug(true|false)/,
      slug: ':slug',
      '...slug': ':slug*',
      ...routes.matchers,
    },
    log: routes.log ?? 'tree',
    logLevel: routes.logLevel ?? 'warn',
    pages: {
      include: [`**/@404.{${pageExts}}`, `**/*@page*.{${pageExts}}`],
      exclude: [],
      ...routes.pages,
    },
    layouts: {
      include: [
        `**/*@layout.{${pageExts}}`,
        `**/*@layout.reset.{${pageExts}}`,
        `**/@layouts/**/*.{${pageExts}}`,
        `**/@layouts/**/*.reset.{${pageExts}}`,
      ],
      exclude: [],
      ...routes.layouts,
    },
    functions: {
      include: [`**/@edge.{${fnExts}}`, `**/@fn.{${fnExts}}`],
      exclude: [],
      ...routes.functions,
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
      app: _app,
      output: _output,
      public: _public,
    },
    client: __client,
    routes: __routes,
    markdown: __markdown,
    sitemap: __sitemap,
    isBuild: false,
    isSSR: false,
  };
}
