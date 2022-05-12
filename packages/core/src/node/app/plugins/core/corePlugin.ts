import {
  type Options as SveltePluginOptions,
  svelte,
} from '@sveltejs/vite-plugin-svelte';
import fs from 'fs-extra';
import {
  type DepOptimizationMetadata,
  type Plugin,
  type UserConfig as ViteConfig,
  type ViteDevServer,
} from 'vite';

import { virtualAliases, virtualModuleRequestPath } from '../../alias';
import type { App } from '../../App';
import { indexHtmlMiddleware } from '../../middleware/indexHtml';
import type { ClientPlugin } from '../ClientPlugin';

const clientPackages = ['@vitebook/core'];

export type CorePluginOptions = {
  svelte?: SveltePluginOptions;
};

export function corePlugin(options: CorePluginOptions = {}): ClientPlugin {
  let app: App;

  let server: ViteDevServer & {
    _optimizeDepsMetadata?: DepOptimizationMetadata;
  };

  const virtualModuleRequestPaths = new Set<string>(
    Object.values(virtualModuleRequestPath),
  );

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
        optimizeDeps: {
          exclude: [...clientPackages],
        },
        // @ts-expect-error - .
        ssr: { noExternal: clientPackages },
        server: {
          fs: {
            strict: !isLocal,
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
    configureApp(_app) {
      app = _app;

      const hasSveltePlugin = app.vite?.config.plugins
        ?.flat()
        .some(
          (plugin) =>
            plugin && (plugin as Plugin).name === 'vite-plugin-svelte',
        );

      if (!hasSveltePlugin) {
        app.plugins.push(
          svelte({
            ...options.svelte,
            extensions: [
              '.svelte',
              '.md',
              ...(options.svelte?.extensions ?? []),
            ],
            compilerOptions: {
              ...options.svelte?.compilerOptions,
              hydratable: true,
            },
          }),
        );
      }
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

      if (id === virtualModuleRequestPath.app) {
        const path = app.dirs.pages.resolve('@app.svelte');
        return fs.existsSync(path)
          ? { id: path }
          : { id: require.resolve('@vitebook/core/App.svelte') };
      }

      if (virtualModuleRequestPaths.has(id)) {
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
