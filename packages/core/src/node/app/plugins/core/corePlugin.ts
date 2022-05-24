import {
  type DepOptimizationMetadata,
  type ModuleNode,
  type UserConfig as ViteConfig,
  type ViteDevServer,
} from 'vite';

import { type ServerContext, type ServerEntryModule } from '../../../../shared';
import { virtualAliases, virtualModuleRequestPath } from '../../alias';
import type { App } from '../../App';
import { installFetch } from '../../installFetch';
import {
  buildDataLoaderScriptTag,
  loadModuleData,
  loadPageDataMap,
} from '../../loader';
import type { ClientPlugin } from '../ClientPlugin';
import { readIndexHtmlFile } from './indexHtml';

const clientPackages = ['@vitebook/core', '@vitebook/svelte'];

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
        server.middlewares.use(async (req, res, next) => {
          const base = `${vite.config.server.https ? 'https' : 'http'}://${
            req.headers[':authority'] || req.headers.host
          }`;

          const url = decodeURI(new URL(base + req.url).pathname);

          if (url.endsWith('.html')) {
            try {
              const index = readIndexHtmlFile(app);

              const transformedIndex = await server.transformIndexHtml(
                url,
                index,
                req.originalUrl,
              );

              const { render } = (await vite.ssrLoadModule(
                serverEntry,
              )) as ServerEntryModule;

              const route = decodeURI(url).replace('/index.html', '/');

              const page =
                app.pages.getPages().find((page) => page.route === route) ??
                app.pages.getPages().find((page) => page.route === '/404.html');

              if (!page) {
                res.statusCode = 404;
                res.end('Not found.');
                return;
              }

              const data: ServerContext['data'] = await loadPageDataMap(
                app,
                page,
                server.ssrLoadModule,
              );

              const dataScript = buildDataLoaderScriptTag(data);

              const { html: appHtml, head } = await render(page, { data });

              const stylesMap = await Promise.all(
                [
                  ...page.layouts.map(
                    (layout) => app.pages.getLayoutByIndex(layout)!.filePath,
                  ),
                  page.filePath,
                ].map((file) => getStylesByFile(vite, file)),
              );

              // Prevent FOUC during development.
              const styles = `<style type="text/css">${Object.values(
                stylesMap.map(Object.values),
              ).join('')}</style>`;

              const html = transformedIndex
                .replace(`<!--@vitebook/head-->`, head + styles)
                .replace(`<!--@vitebook/app-->`, appHtml)
                .replace('<!--@vitebook/body-->', dataScript);

              res.statusCode = 200;
              res.setHeader('Content-Type', 'text/html');
              res.end(html);
            } catch (e) {
              vite.ssrFixStacktrace(e as Error);
              next(e);
            }
          }

          if (url.startsWith('/assets/data/pages')) {
            try {
              const [file, path] = url.replace('/assets/data/', '').split('/');
              const modulePath = file.replace(/_/g, '/');
              const route = path.replace(/_/g, '/').replace(/\.json$/, '');

              const data = await loadModuleData(
                app,
                modulePath,
                route,
                server.ssrLoadModule,
              );

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            } catch (e) {
              vite.ssrFixStacktrace(e as Error);
              next(e);
            }
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

// Vite doesn't expose this so we just copy the list for now
const styleRE = /\.(css|less|sass|scss|styl|stylus|pcss|postcss)$/;
export async function getStylesByFile(vite: ViteDevServer, file: string) {
  const files = await vite.moduleGraph.getModulesByFile(file);
  const node = Array.from(files ?? [])[0];

  if (!node) throw new Error(`Could not find node for ${file}`);

  const deps = new Set<ModuleNode>();
  await findModuleDeps(vite, node, deps);

  const styles: Record<string, string> = {};

  for (const dep of deps) {
    const parsed = new URL(dep.url, 'http://localhost/');
    const query = parsed.searchParams;

    if (
      styleRE.test(dep.file!) ||
      (query.has('svelte') && query.get('type') === 'style')
    ) {
      try {
        const mod = await vite.ssrLoadModule(dep.url, { fixStacktrace: false });
        styles[dep.url] = mod.default;
      } catch {
        // no-op
      }
    }
  }

  return styles;
}

export async function findModuleDeps(
  vite: ViteDevServer,
  node: ModuleNode,
  deps: Set<ModuleNode>,
) {
  const edges: Promise<void>[] = [];

  async function add(node: ModuleNode) {
    if (!deps.has(node)) {
      deps.add(node);
      await findModuleDeps(vite, node, deps);
    }
  }

  async function addByUrl(url: string) {
    const node = await vite.moduleGraph.getModuleByUrl(url);
    if (node) await add(node);
  }

  if (node.ssrTransformResult) {
    if (node.ssrTransformResult.deps) {
      node.ssrTransformResult.deps.forEach((url) => edges.push(addByUrl(url)));
    }
  } else {
    node.importedModules.forEach((node) => edges.push(add(node)));
  }

  await Promise.all(edges);
}
