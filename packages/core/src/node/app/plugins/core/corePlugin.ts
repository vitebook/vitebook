import {
  type DepOptimizationMetadata,
  type UserConfig as ViteConfig,
  type ViteDevServer,
} from 'vite';

import { virtualAliases, virtualModuleRequestPath } from '../../alias';
import type { App } from '../../App';
import { indexHtmlMiddleware } from '../../middleware/indexHtml';
import type { Plugin } from '../Plugin';

const clientPackages = ['@vitebook/core', '@vitebook/svelte'];

export type ResolvedCorePluginConfig = {
  // no-options
};

export type CorePluginConfig = Partial<ResolvedCorePluginConfig>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function corePlugin(config: ResolvedCorePluginConfig): Plugin {
  let app: App;

  let server: ViteDevServer & {
    _optimizeDepsMetadata?: DepOptimizationMetadata;
  };

  return {
    name: '@vitebook/core',
    enforce: 'pre',
    config() {
      const config: ViteConfig = {
        resolve: {
          alias: {
            $src: app.dirs.root.resolve('src'),
            ...virtualAliases,
          },
        },
        optimizeDeps: {
          exclude: [...clientPackages],
        },
        // @ts-expect-error - .
        ssr: { noExternal: clientPackages },
        server: {
          fs: {
            allow: [
              app.dirs.cwd.path,
              app.dirs.cwd.resolve('node_modules'),
              app.dirs.root.path,
              app.dirs.pages.path,
              app.dirs.public.path,
              app.dirs.out.path,
              app.dirs.tmp.path,
            ],
          },
        },
      };

      return config;
    },
    vitebookInit(_app) {
      app = _app;
    },
    configureServer(_server) {
      server = _server;

      app.disposal.add(() => {
        _server.close.bind(_server);
      });

      _server.httpServer?.on('close', () => {
        app.close();
      });

      // Serve our index.html after Vite history fallback.
      return () => {
        server.middlewares.use(indexHtmlMiddleware(app, server));
      };
    },
    resolveId(id) {
      // Vite will inject version hash into file queries, which does not work well with Vitebook.
      // As a workaround we remove the version hash to avoid the injection.
      // Thanks: https://github.com/vuepress/vuepress-next
      if (server?._optimizeDepsMetadata?.browserHash) {
        server._optimizeDepsMetadata.browserHash = '';
      }

      if (id === virtualModuleRequestPath.clientEntry) {
        return { id: app.client.entry.client };
      }

      if (id === virtualModuleRequestPath.noop) {
        return id;
      }

      return null;
    },
    async load(id) {
      if (id === virtualModuleRequestPath.noop) {
        return `export default function() {};`;
      }

      return null;
    },
  };
}
