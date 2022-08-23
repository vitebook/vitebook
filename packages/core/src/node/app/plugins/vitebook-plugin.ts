import type { OutputBundle } from 'rollup';
import path from 'upath';
import {
  type Plugin as VitePlugin,
  type ResolvedConfig as ViteResolvedConfig,
} from 'vite';

import { coalesceToError, DATA_ASSET_BASE_URL } from '../../../shared';
import { mkdirp, rimraf } from '../../utils';
import { virtualAliases, virtualModuleRequestPath } from '../alias';
import type { App, AppFactory } from '../App';
import { build, createServerBundle, resolveBuildConfig } from '../build';
import type { AppConfig } from '../config/AppConfig';
import { createAppFactory } from '../create/app-factory';
import { installFetch } from '../polyfills';
import { handleDataRequest } from './core/handle-data';
import { handlePageRequest } from './core/handle-page';
import { markdownPlugin } from './markdown/markdown-plugin';
import { nodesPlugin } from './nodes/nodes-plugin';

const clientPackages = [
  '@vitebook/core',
  '@vitebook/svelte',
  'urlpattern-polyfill/urlpattern',
];

export type VitebookPluginConfig = AppConfig;

export function vitebookPlugin(
  config: VitebookPluginConfig = {},
): VitePlugin[] {
  let app: App, appFactory: AppFactory, viteConfig: ViteResolvedConfig;

  let isFirstBuild = true,
    clientBundle: OutputBundle | null = null;

  return [
    {
      name: '@vitebook/core',
      enforce: 'pre',
      async config(viteConfig, env) {
        appFactory = await createAppFactory(config, viteConfig, env);
        app = await appFactory.create();
        return {
          ...resolveBuildConfig(app),
          resolve: { alias: virtualAliases },
          optimizeDeps: { exclude: clientPackages },
          ssr: { noExternal: clientPackages },
          server: {
            fs: {
              allow: [
                path.dirname(app.entry.client),
                path.dirname(app.entry.server),
                app.dirs.cwd.path,
                app.dirs.root.path,
                app.dirs.app.path,
                app.dirs.public.path,
                app.dirs.out.path,
                app.dirs.tmp.path,
                app.dirs.cwd.resolve('node_modules'),
                app.dirs.workspace.resolve('node_modules'),
              ],
            },
          },
        };
      },
      async configResolved(_viteConfig) {
        viteConfig = _viteConfig;
        app.vite.resolved = _viteConfig;
      },
      async configureServer(server) {
        installFetch();
        app.vite.server = server;
        return () => {
          removeHtmlMiddlewares(server.middlewares);

          server.middlewares.use(async (req, res, next) => {
            try {
              if (!req.url || !req.method) {
                throw new Error('Incomplete request');
              }

              const base = `${
                server.config.server.https ? 'https' : 'http'
              }://${req.headers[':authority'] || req.headers.host}`;

              const url = new URL(base + req.url);
              const decodedUrl = decodeURI(new URL(base + req.url).pathname);

              if (decodedUrl.startsWith(DATA_ASSET_BASE_URL)) {
                return handleDataRequest(url, app, res);
              }

              if (decodedUrl.endsWith('/') || decodedUrl.endsWith('.html')) {
                url.pathname = url.pathname.replace('/index.html', '/');
                return handlePageRequest(url, app, req, res);
              }
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (e) {
              const error = coalesceToError(e);
              res.statusCode = 500;
              res.end(
                error.stack
                  ? server.ssrRewriteStacktrace(error.stack)
                  : error.stack,
              );
            }

            next();
          });
        };
      },
      resolveId(id) {
        if (id === virtualModuleRequestPath.client) {
          return { id: app.entry.client };
        }

        if (
          id === virtualModuleRequestPath.app ||
          id === virtualModuleRequestPath.noop
        ) {
          return id;
        }

        return null;
      },
      async load(id) {
        if (id === virtualModuleRequestPath.app) {
          const id = app.config.client.app;
          const baseUrl = app.vite.resolved!.base;
          const configs = app.config.client.configFiles;
          return [
            `import * as App from "${id}";`,
            '',
            configs
              .map(
                (id, i) =>
                  `import { configureApp as configureApp$${i} } from "${id}";`,
              )
              .join('\n'),
            '',
            `export default {
            id: "${id}",
            baseUrl: "${baseUrl}",
            module: App,
            configs: [${configs.map((_, i) => `configureApp$${i}`).join(', ')}]
          };`,
          ].join('\n');
        }

        if (id === virtualModuleRequestPath.noop) {
          return `export default function() {};`;
        }

        return null;
      },
      async buildStart() {
        if (app.config.isSSR) return;

        // Reset for new build. Goes here because `build --watch` calls buildStart but not config.
        clientBundle = null;

        if (app.config.isBuild) {
          rimraf(appFactory.dirs.out.path);
          mkdirp(appFactory.dirs.out.path);

          // Skip first build because $app is initialized in `configResolved` hook.
          if (!isFirstBuild) {
            app?.destroy();
            app = await appFactory.create();
            app.vite.resolved = viteConfig;
          }

          isFirstBuild = false;
        }
      },
      async writeBundle(_, bundle) {
        if (app.config.isSSR) return;
        clientBundle = bundle;
        await createServerBundle();
      },
      async closeBundle() {
        // Vite calls `closeBundle` when dev server restarts so we ignore it.
        if (app.config.isSSR || !clientBundle || !app) {
          app?.destroy();
          return;
        }

        await build(app, clientBundle);
        clientBundle = null;
      },
      generateBundle(_, bundle) {
        // SSR build - delete all assets.
        if (app.config.isSSR) {
          for (const name in bundle) {
            if (bundle[name].type === 'asset') {
              delete bundle[name];
            }
          }
        }
      },
    },
    markdownPlugin(),
    nodesPlugin(),
  ];
}

function removeHtmlMiddlewares(server) {
  const middlewares = ['viteIndexHtmlMiddleware', 'viteSpaFallbackMiddleware'];
  for (let i = server.stack.length - 1; i > 0; i--) {
    if (middlewares.includes(server.stack[i].handle.name)) {
      server.stack.splice(i, 1);
    }
  }
}
