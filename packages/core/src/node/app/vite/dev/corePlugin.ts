import { watch } from 'chokidar';
import kleur from 'kleur';
import {
  Plugin as VitePlugin,
  UserConfig as ViteConfig,
  ViteDevServer
} from 'vite';

import { prettyJsonStr } from '../../../../shared/index.js';
import { logger } from '../../../utils/logger.js';
import { resolveRelativePath } from '../../../utils/path.js';
import type { App } from '../../App.js';
import {
  loadPagesVirtualModule,
  resolvePages
} from '../../create/resolvePages.js';
import { resolveApp } from '../../resolveApp.js';
import { virtualModuleId, virtualModuleRequestPath } from './alias.js';
import { indexHtmlMiddleware } from './middlewares/indexHtml.js';

export async function corePlugin(app: App): Promise<VitePlugin> {
  let server: ViteDevServer;

  const virtualModuleRequestPaths = new Set<string>(
    Object.values(virtualModuleRequestPath)
  );

  return {
    name: 'vitebook/core',
    enforce: 'pre',
    config() {
      const config: ViteConfig = {
        resolve: {
          alias: {
            '~config': app.dirs.config.path,
            '~theme': app.dirs.theme.path,
            [virtualModuleId.noop]: virtualModuleRequestPath.noop,
            [virtualModuleId.siteOptions]: virtualModuleRequestPath.siteOptions,
            [virtualModuleId.themeEntry]: virtualModuleRequestPath.themeEntry,
            [virtualModuleId.clientEntry]: virtualModuleRequestPath.clientEntry,
            [virtualModuleId.pages]: virtualModuleRequestPath.pages
          }
        },
        build: {
          rollupOptions: {
            input: app.dirs.config.resolve('index.html')
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
      if (id === virtualModuleRequestPath.clientEntry) {
        return { id: app.client.entry.client };
      }

      if (id === virtualModuleRequestPath.themeEntry) {
        return { id: app.dirs.theme.resolve('index.ts') };
      }

      if (virtualModuleRequestPaths.has(id)) {
        return id;
      }

      return null;
    },
    load(id) {
      if (id === virtualModuleRequestPath.noop) {
        return `export default function() {};`;
      }

      if (id === virtualModuleRequestPath.siteOptions) {
        return `export default ${prettyJsonStr(app.site.options)};`;
      }

      if (id === virtualModuleRequestPath.pages) {
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
          server.moduleGraph.getModuleById(
            virtualModuleRequestPath.siteOptions
          )!
        ];
      }

      return undefined;
    }
  };
}

function startWatchingPages(app: App, server: ViteDevServer) {
  const watcher = watch(app.options.include, {
    cwd: app.dirs.root.path,
    ignoreInitial: true
  });

  async function handleChange(
    filePath: string,
    action: 'add' | 'change' | 'unlink'
  ): Promise<void> {
    const previousPages = JSON.stringify(app.pages);
    const absPath = resolveRelativePath(app.dirs.root.path, filePath);
    await resolvePages(app, action, [absPath]);
    if (previousPages !== JSON.stringify(app.pages)) {
      server.watcher.emit('change', virtualModuleRequestPath.pages);
    }
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
