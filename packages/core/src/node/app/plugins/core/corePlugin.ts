import path from 'upath';
import {
  type DepOptimizationMetadata,
  searchForWorkspaceRoot,
  type UserConfig as ViteConfig,
  type ViteDevServer,
} from 'vite';

import { coalesceToError, DATA_ASSET_BASE_URL } from '../../../../shared';
import { virtualAliases, virtualModuleRequestPath } from '../../alias';
import type { App } from '../../App';
import { installFetch } from '../../installFetch';
import type { ClientPlugin } from '../ClientPlugin';
import { handleDataRequest } from './handleDataRequest';
import { handlePageRequest } from './handlePageRequest';

const clientPackages = [
  '@vitebook/core',
  '@vitebook/svelte',
  'urlpattern-polyfill/urlpattern',
];

export type ResolvedCorePluginConfig = {
  // no-options
};

export type CorePluginConfig = Partial<ResolvedCorePluginConfig>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function corePlugin(config: ResolvedCorePluginConfig): ClientPlugin {
  let app: App;

  let server: ViteDevServer & {
    _optimizeDepsMetadata?: DepOptimizationMetadata;
  };

  const clientEntry = require.resolve(`@vitebook/core/entry-client.js`);
  const serverEntry = require.resolve(`@vitebook/core/entry-server.js`);
  const isLocal = clientEntry.includes('packages/core/dist/client');

  return {
    name: '@vitebook/core',
    enforce: 'pre',
    entry: {
      client: clientEntry,
      server: serverEntry,
    },
    config() {
      const config: ViteConfig = {
        resolve: {
          alias: {
            $src: app.dirs.root.resolve('src'),
            ...virtualAliases,
          },
        },
        optimizeDeps: { exclude: clientPackages },
        ssr: { noExternal: clientPackages },
        server: {
          fs: {
            allow: [
              app.dirs.cwd.path,
              app.dirs.root.path,
              app.dirs.pages.path,
              app.dirs.public.path,
              app.dirs.out.path,
              app.dirs.tmp.path,
              app.dirs.cwd.resolve('node_modules'),
              path.resolve(
                searchForWorkspaceRoot(app.dirs.cwd.path),
                'node_modules',
              ),
            ],
            strict: !isLocal,
          },
        },
      };

      return config;
    },
    vitebookInit(_app) {
      app = _app;
    },
    configureServer(vite) {
      installFetch();

      server = vite;

      app.disposal.add(() => {
        vite.close.bind(vite);
      });

      vite.httpServer?.on('close', () => {
        app.close();
      });

      return () => {
        removeHtmlMiddlewares(server.middlewares);

        server.middlewares.use(async (req, res, next) => {
          try {
            if (!req.url || !req.method) {
              throw new Error('Incomplete request');
            }

            const base = `${vite.config.server.https ? 'https' : 'http'}://${
              req.headers[':authority'] || req.headers.host
            }`;

            const url = new URL(base + req.url);
            const decodedUrl = decodeURI(new URL(base + req.url).pathname);

            if (decodedUrl.startsWith(DATA_ASSET_BASE_URL)) {
              return handleDataRequest(url, app, server, res);
            }

            if (decodedUrl.endsWith('/') || decodedUrl.endsWith('.html')) {
              url.pathname = url.pathname.replace('/index.html', '/');
              return handlePageRequest(url, app, server, req, res);
            }
          } catch (e) {
            const error = coalesceToError(e);
            vite.ssrFixStacktrace(error);
            res.statusCode = 500;
            res.end(error.stack);
          }

          next();
        });
      };
    },
    resolveId(id) {
      // Vite will inject version hash into file queries, which does not work well with Vitebook.
      // As a workaround we remove the version hash to avoid the injection.
      // Thanks: https://github.com/vuepress/vuepress-next
      if (server?._optimizeDepsMetadata?.browserHash) {
        server._optimizeDepsMetadata.browserHash = '';
      }

      if (id === virtualModuleRequestPath.client) {
        return { id: app.client.entry.client };
      }

      if (id === virtualModuleRequestPath.app) {
        return id;
      }

      if (id === virtualModuleRequestPath.noop) {
        return id;
      }

      return null;
    },
    async load(id) {
      if (id === virtualModuleRequestPath.app) {
        const id = app.config.client.app;
        const baseUrl = app.vite?.config.base ?? '/';
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
  };
}

// using internals until https://github.com/vitejs/vite/pull/4640 is merged
function removeHtmlMiddlewares(server) {
  const middlewares = ['viteIndexHtmlMiddleware', 'viteSpaFallbackMiddleware'];

  for (let i = server.stack.length - 1; i > 0; i--) {
    if (middlewares.includes(server.stack[i].handle.name)) {
      server.stack.splice(i, 1);
    }
  }
}
