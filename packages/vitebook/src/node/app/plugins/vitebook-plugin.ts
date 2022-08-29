import type { OutputBundle } from 'rollup';
import path from 'upath';
import {
  type Plugin as VitePlugin,
  type ResolvedConfig as ViteResolvedConfig,
} from 'vite';

import { rimraf } from '../../utils';
import { virtualAliases, virtualModuleRequestPath } from '../alias';
import type { App, AppFactory } from '../App';
import { build, createServerBundle, resolveBuildConfig } from '../build';
import type { AppConfig } from '../config/AppConfig';
import { createAppFactory } from '../create/app-factory';
import { installPolyfills } from '../polyfills';
import { configureDevServer } from './core/dev-server';
import { configurePreviewServer } from './core/preview-server';
import { markdownPlugin } from './markdown/markdown-plugin';
import { nodesPlugin } from './nodes/nodes-plugin';

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
                path.dirname(app.entry.client),
                path.dirname(app.entry.server),
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
    nodesPlugin(),
  ];
}
