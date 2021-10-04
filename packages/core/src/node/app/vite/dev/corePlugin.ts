import { watch } from 'chokidar';
import debounce from 'just-debounce-it';
import kleur from 'kleur';
import {
  Plugin as VitePlugin,
  UserConfig as ViteConfig,
  ViteDevServer
} from 'vite';

import { isArray, prettyJsonStr } from '../../../../shared/index.js';
import { logger } from '../../../utils/logger.js';
import { isSubpath, resolveRelativePath } from '../../../utils/path.js';
import type { App } from '../../App.js';
import {
  loadPagesVirtualModule,
  resolvePages
} from '../../create/resolvePages.js';
import { resolveApp } from '../../resolveApp.js';
import { virtualModuleId, virtualModuleRequestPath } from './alias.js';
import { indexHtmlMiddleware } from './middlewares/indexHtml.js';

let pageChangesPending: Promise<void> | undefined;

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
    async load(id) {
      if (id === virtualModuleRequestPath.noop) {
        return `export default function() {};`;
      }

      if (id === virtualModuleRequestPath.siteOptions) {
        return `export default ${prettyJsonStr(app.site.options)};`;
      }

      if (id === virtualModuleRequestPath.pages) {
        await pageChangesPending;
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

  server.watcher.add(virtualModuleRequestPath.pages);

  let resolvePendingChanges: (() => void) | undefined;

  type ChangedFiles = {
    filePaths: string | string[];
    action: 'add' | 'change' | 'unlink';
  };

  let pendingChanges: ChangedFiles[] = [];

  const resolveNewPages = debounce(async () => {
    const prevNoOfPages = app.pages.length;

    groupPendingChanges();

    for (const { filePaths, action } of pendingChanges) {
      const absPaths = (filePaths as string[]).map((filePath) =>
        resolveRelativePath(app.dirs.root.path, filePath)
      );

      await resolvePages(app, action, absPaths);
    }

    pendingChanges = [];
    resolvePendingChanges?.();
    pageChangesPending = undefined;
    resolvePendingChanges = undefined;

    // Server is not aware of new pages being added.
    if (app.pages.length > prevNoOfPages) {
      server.watcher.emit('change', virtualModuleRequestPath.pages);
    }
  }, 300);

  async function handleChange(changedFiles: ChangedFiles): Promise<void> {
    if (!pageChangesPending) {
      pageChangesPending = new Promise((res) => {
        resolvePendingChanges = res;
      });
    }

    pendingChanges.push(changedFiles);
    resolveNewPages();
  }

  watcher
    .on('add', (filePath) =>
      handleChange({ filePaths: filePath, action: 'add' })
    )
    .on('change', (filePath) =>
      handleChange({ filePaths: filePath, action: 'change' })
    )
    .on('unlink', (filePath) =>
      handleChange({ filePaths: filePath, action: 'unlink' })
    );

  server.watcher.on('unlinkDir', (dir) => {
    const filePaths: string[] = [];

    app.pages.forEach((page) => {
      if (isSubpath(dir, page.filePath)) {
        filePaths.push(page.filePath);
      }
    });

    if (filePaths.length > 0) {
      handleChange({
        filePaths,
        action: 'unlink'
      });
    }
  });

  app.disposal.add(() => {
    resolveNewPages.cancel();
    pendingChanges = [];
    watcher.close();
  });

  function groupPendingChanges() {
    const seen = new Set<ChangedFiles>();
    const changes: ChangedFiles[] = [];

    for (let i = 0; i < pendingChanges.length; i += 1) {
      const change = pendingChanges[i];

      if (seen.has(change)) continue;

      change.filePaths = isArray(change.filePaths)
        ? change.filePaths
        : [change.filePaths];

      let j = i + 1;
      while (
        j < pendingChanges.length &&
        pendingChanges[j].action === change.action
      ) {
        const subsequentChange = pendingChanges[j];

        if (isArray(subsequentChange.filePaths)) {
          change.filePaths.push(...subsequentChange.filePaths);
        } else {
          change.filePaths.push(subsequentChange.filePaths);
        }

        seen.add(subsequentChange);

        j += 1;
      }

      changes.push(change);
    }

    pendingChanges = changes;
  }
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
