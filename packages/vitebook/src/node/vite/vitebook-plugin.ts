import type { App, AppFactory } from 'node/app/App';
import type { AppConfig } from 'node/app/config';
import { createAppFactory } from 'node/app/create/app-factory';
import { build, createServerBundle, resolveBuildConfig } from 'node/build';
import { rimraf } from 'node/utils';
import path from 'node:path';
import type { OutputBundle } from 'rollup';
import { installPolyfills } from 'server/polyfills';
import {
  type Plugin as VitePlugin,
  type ResolvedConfig as ViteResolvedConfig,
} from 'vite';

import { virtualAliases, virtualModuleRequestPath } from './alias';
import { configureDevServer } from './core/dev-server';
import { configurePreviewServer } from './core/preview-server';
import { filesPlugin } from './files/files-plugin';
import { markdownPlugin } from './markdown/markdown-plugin';

const clientPackages = [
  'vitebook',
  '@vitebook/svelte',
  'urlpattern-polyfill/urlpattern',
];

export type VitebookPluginConfig = AppConfig;

export function vitebookPlugin(
  config: VitebookPluginConfig = {},
): VitePlugin[] {
  let app: App, appFactory: AppFactory, viteConfig: ViteResolvedConfig;

  let isFirstBuild = true,
    clientBundle: OutputBundle | null = null,
    serverBundle: OutputBundle | null = null;

  return [
    {
      name: 'vitebook',
      enforce: 'pre',
      async config(viteConfig, env) {
        appFactory = await createAppFactory(config, viteConfig, env);
        app = await appFactory.create();
        return {
          ...resolveBuildConfig(app),
          envPrefix: 'PUBLIC_',
          resolve: { alias: virtualAliases },
          optimizeDeps: { exclude: clientPackages },
          ssr: { noExternal: clientPackages },
          server: {
            fs: {
              allow: [
                path.posix.dirname(app.config.entry.client),
                path.posix.dirname(app.config.entry.server),
                app.dirs.cwd.path,
                app.dirs.root.path,
                app.dirs.app.path,
                app.dirs.public.path,
                app.dirs.build.path,
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
        await installPolyfills();
        app.vite.server = server;
        return () => {
          configureDevServer(app, server);
        };
      },
      async configurePreviewServer(server) {
        await configurePreviewServer(app, server);
      },
      resolveId(id) {
        if (id === virtualModuleRequestPath.client) {
          return { id: app.config.entry.client };
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
          return [
            `import * as App from "${id}";`,
            '',
            'export default {',
            `  id: "${id}",`,
            `  baseUrl: "${baseUrl}",`,
            `  module: App,`,
            `};`,
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
          rimraf(appFactory.dirs.tmp.path);
          rimraf(appFactory.dirs.build.path);

          // Skip first build because $app is initialized in `configResolved` hook.
          if (!isFirstBuild) {
            app = await appFactory.create();
            app.vite.resolved = viteConfig;
          }

          isFirstBuild = false;
        }
      },
      async writeBundle(_, bundle) {
        if (app.config.isSSR) return;
        clientBundle = bundle;
        await createServerBundle((bundle) => {
          serverBundle = bundle;
        });
      },
      async closeBundle() {
        // Vite calls `closeBundle` when dev server restarts so we ignore it.
        if (app.config.isSSR || !clientBundle || !app || !serverBundle) {
          app?.destroy();
          return;
        }

        await build(app, clientBundle, serverBundle);
        clientBundle = null;
        serverBundle = null;
        app.destroy();
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
    filesPlugin(),
  ];
}
