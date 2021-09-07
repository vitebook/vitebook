import { watch } from 'chokidar';
import kleur from 'kleur';
import {
  Plugin as VitePlugin,
  UserConfig as ViteConfig,
  ViteDevServer
} from 'vite';

import { prettyJsonStr } from '../../../utils/json.js';
import { logger } from '../../../utils/logger.js';
import type { App } from '../../App.js';
import {
  loadPagesVirtualModule,
  resolvePages
} from '../../create/resolvePages.js';
import { resolveApp } from '../../resolveApp.js';
import { virtualModuleId } from './alias.js';
import {
  indexHtmlMiddleware,
  resolveIndexHtmlFilePath
} from './middlewares/indexHtml.js';

export async function corePlugin(app: App): Promise<VitePlugin> {
  let server: ViteDevServer;

  const virtualModules = new Set<string>(Object.values(virtualModuleId));

  return {
    name: 'vitebook/core',
    enforce: 'pre',
    config() {
      const config: ViteConfig = {
        resolve: {
          alias: {
            '@src': app.dirs.src.path,
            '@config': app.dirs.config.path,
            '@theme': app.dirs.theme.path
          }
        },
        build: {
          rollupOptions: {
            input: resolveIndexHtmlFilePath()
          }
        }
      };

      return config;
    },
    async configResolved(config) {
      (app.options.vite.resolve ??= {}).alias = config.resolve.alias;
      // Resolve pages after aliases have been resolved.
      await resolvePages(app, 'add');
    },
    configureServer(devServer) {
      server = devServer;
      server.watcher.add(app.dirs.config.path);
      startWatchingPages(app, devServer);

      app.disposal.add(() => {
        devServer.close.bind(devServer);
      });

      devServer.httpServer?.on('close', () => {
        app.close();
      });

      // Serve our index.html after Vite history fallback.
      return () => {
        server.middlewares.use(indexHtmlMiddleware(app, server));
      };
    },
    resolveId(id) {
      if (id === virtualModuleId.clientEntry) {
        return { id: app.client.entry.client };
      }

      if (virtualModules.has(id)) {
        return id;
      }

      return null;
    },
    load(id) {
      if (id === virtualModuleId.noop) {
        return `export default function() {};`;
      }

      if (id === virtualModuleId.siteData) {
        return `export default ${prettyJsonStr(app.site.options)};`;
      }

      if (id === virtualModuleId.pages) {
        return loadPagesVirtualModule(app);
      }

      return null;
    },
    generateBundle(_, bundle) {
      if (app.env.isSSR) {
        // SSR build - delete all asset chunks.
        for (const name in bundle) {
          if (bundle[name].type === 'asset') {
            delete bundle[name];
          }
        }
      }
    },
    async handleHotUpdate(ctx) {
      const { file } = ctx;

      if (file === app.configPath) {
        await resolveNewSiteData(app);
        return [
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          server.moduleGraph.getModuleById(virtualModuleId.siteData)!
        ];
      }

      return undefined;
    }
  };
}

function startWatchingPages(app: App, server: ViteDevServer) {
  const watcher = watch(app.options.pages, {
    cwd: app.dirs.src.path,
    ignoreInitial: true
  });

  async function handleChange(
    filePath: string,
    action: 'add' | 'change' | 'unlink'
  ): Promise<void> {
    await resolvePages(app, action, [filePath]);
    server.moduleGraph.invalidateModule(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      server.moduleGraph.getModuleById(virtualModuleId.pages)!
    );
  }

  watcher
    .on('add', (p) => handleChange(p, 'add'))
    .on('change', (p) => handleChange(p, 'change'))
    .on('unlink', (p) => handleChange(p, 'unlink'));

  app.disposal.add(() => {
    watcher.close();
  });
}

async function resolveNewSiteData(app: App) {
  const newApp = await resolveApp(app.options.cliArgs);
  const newSiteOptions = newApp.site.options;

  if (app.site.options.baseUrl !== newSiteOptions.baseUrl) {
    logger.warn(
      logger.formatWarnMsg(
        `Config property ${kleur.bold(
          '`site.baseUrl`'
        )} was changed. Please restart the dev server.`
      )
    );
  }

  // unresolved (raw from user config)
  app.options.site = newApp.options.site;
  // resolved
  app.site.options = newSiteOptions;
}
