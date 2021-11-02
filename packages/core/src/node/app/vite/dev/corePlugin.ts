import { watch } from 'chokidar';
import debounce from 'just-debounce-it';
import kleur from 'kleur';
import {
  DepOptimizationMetadata,
  UserConfig as ViteConfig,
  ViteDevServer,
} from 'vite';

import { isArray, prettyJsonStr } from '../../../../shared';
import { globby } from '../../../utils';
import { logger } from '../../../utils/logger';
import { isSubpath, resolveRelativePath } from '../../../utils/path';
import type { App } from '../../App';
import {
  loadPagesVirtualModule,
  resolvePages,
} from '../../create/resolvePages';
import type { Plugin } from '../../plugin/Plugin';
import { resolveApp } from '../../resolveApp';
import { virtualModuleId, virtualModuleRequestPath } from './alias';
import { indexHtmlMiddleware } from './middlewares/indexHtml';

let pageChangesPending: Promise<void> | undefined;

const clientPackages = [
  '@vitebook/core',
  '@vitebook/client',
  '@vitebook/theme-default',
  '@vitebook/markdown',
  '@vitebook/markdown-preact',
  '@vitebook/markdown-prismjs',
  '@vitebook/markdown-shiki',
  '@vitebook/markdown-svelte',
  '@vitebook/markdown-vue',
  '@vitebook/preact',
  '@vitebook/vue',
];

export function corePlugin(): Plugin {
  let app: App;

  let server: ViteDevServer & {
    _optimizeDepsMetadata?: DepOptimizationMetadata;
  };

  const virtualModuleRequestPaths = new Set<string>(
    Object.values(virtualModuleRequestPath),
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
            [virtualModuleId.pages]: virtualModuleRequestPath.pages,
          },
        },
        optimizeDeps: { exclude: clientPackages },
        // @ts-expect-error - not typed.
        ssr: { noExternal: clientPackages },
      };

      return config;
    },
    configureApp(_app) {
      app = _app;
    },
    async configResolved() {
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
      // Vite will inject version hash into file queries, which does not work well with Vitebook.
      // As a workaround we remove the version hash to avoid the injection.
      // Thanks: https://github.com/vuepress/vuepress-next
      if (server?._optimizeDepsMetadata?.browserHash) {
        server._optimizeDepsMetadata.browserHash = '';
      }

      if (id === virtualModuleRequestPath.clientEntry) {
        return { id: app.client.entry.client };
      }

      if (id === virtualModuleRequestPath.themeEntry) {
        return {
          id: app.dirs.theme.resolve(
            globby.sync('index.{js,ts,jsx,tsx}', {
              cwd: app.dirs.theme.path,
            })[0],
          ),
        };
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
    async handleHotUpdate(ctx) {
      const { file } = ctx;

      if (file === app.configPath) {
        await resolveNewSiteData(app);
        return [
          server.moduleGraph.getModuleById(
            virtualModuleRequestPath.siteOptions,
          )!,
        ];
      }

      return undefined;
    },
  };
}

function startWatchingPages(app: App, server: ViteDevServer) {
  const watcher = watch(app.options.include, {
    cwd: app.dirs.root.path,
    ignoreInitial: true,
  });

  server.watcher.add(virtualModuleRequestPath.pages);

  let resolvePendingChanges: (() => void) | undefined;

  type ChangedFiles = {
    filePaths: string | string[];
    action: 'add' | 'change' | 'unlink';
  };

  let pendingChanges: ChangedFiles[] = [];

  const resolveNewPages = debounce(async () => {
    // const prevNoOfPages = app.pages.length;

    groupPendingChanges();

    for (const { filePaths, action } of pendingChanges) {
      const absPaths = (filePaths as string[]).map((filePath) =>
        resolveRelativePath(app.dirs.root.path, filePath),
      );

      await resolvePages(app, action, absPaths);
    }

    pendingChanges = [];
    resolvePendingChanges?.();
    pageChangesPending = undefined;
    resolvePendingChanges = undefined;

    // Need to emit all changes to ensure pages is hot updated on the client, so current page meta
    // is also hot updated.
    server.watcher.emit('change', virtualModuleRequestPath.pages);

    // Server is not aware of new pages being added.
    // if (app.pages.length > prevNoOfPages) {
    // }
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
      handleChange({ filePaths: filePath, action: 'add' }),
    )
    .on('change', (filePath) =>
      handleChange({ filePaths: filePath, action: 'change' }),
    )
    .on('unlink', (filePath) =>
      handleChange({ filePaths: filePath, action: 'unlink' }),
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
        action: 'unlink',
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
          '`site.baseUrl`',
        )} was changed. Please restart the dev server.`,
      ),
    );
  }

  // unresolved (raw from user config)
  app.options.site = newApp.options.site;
  // resolved
  app.site.options = newSiteOptions;
}
