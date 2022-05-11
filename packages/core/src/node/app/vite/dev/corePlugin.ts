import fs from 'fs-extra';
import debounce from 'just-debounce-it';
import MagicString from 'magic-string';
import path from 'upath';
import {
  DepOptimizationMetadata,
  UserConfig as ViteConfig,
  ViteDevServer,
} from 'vite';

import { isArray } from '../../../../shared';
import { isSubpath, resolveRelativePath } from '../../../utils/path';
import type { App } from '../../App';
import {
  loadPagesVirtualModule,
  resolvePages,
} from '../../create/resolvePages';
import type { ClientPlugin } from '../../plugin/ClientPlugin';
import type { Plugin } from '../../plugin/Plugin';
import { virtualModuleId, virtualModuleRequestPath } from './alias';
import { indexHtmlMiddleware } from './indexHtml';

let pageChangesPending: Promise<void> | undefined;

const clientPackages = ['@vitebook/core'];

const DEFAULT_INCLUDE_RE = /\.(md|svelte)($|\?)/;

export function corePlugin(): ClientPlugin {
  let app: App;

  let server: ViteDevServer & {
    _optimizeDepsMetadata?: DepOptimizationMetadata;
  };

  const virtualModuleRequestPaths = new Set<string>(
    Object.values(virtualModuleRequestPath),
  );

  return {
    name: '@vitebook/core',
    enforce: 'pre',
    entry: {
      client: require.resolve(`@vitebook/core/entry-client.js`),
      server: require.resolve(`@vitebook/core/entry-server.js`),
    },
    config() {
      const config: ViteConfig = {
        resolve: {
          alias: {
            $lib: app.dirs.root.resolve('lib'),
            [virtualModuleId.app]: virtualModuleRequestPath.app,
            [virtualModuleId.noop]: virtualModuleRequestPath.noop,
            [virtualModuleId.clientEntry]: virtualModuleRequestPath.clientEntry,
            [virtualModuleId.pages]: virtualModuleRequestPath.pages,
          },
        },
        optimizeDeps: {
          exclude: [...clientPackages],
        },
        // @ts-expect-error - .
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
      server.watcher.add(app.dirs.pages.path);
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
    resolvePage({ filePath }) {
      if (DEFAULT_INCLUDE_RE.test(filePath)) {
        const type = path.extname(filePath).slice(1);
        return { type };
      }

      return null;
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
        const path = app.dirs.root.resolve('App.svelte');
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

      if (id === virtualModuleRequestPath.pages) {
        await pageChangesPending;
        return loadPagesVirtualModule(app);
      }

      return null;
    },
    async handleHotUpdate() {
      // ...
    },
  };
}

function startWatchingPages(app: App, server: ViteDevServer) {
  server.watcher.add(
    app.options.include.map((glob) => `${app.dirs.pages.path}/${glob}`),
  );

  server.watcher.add(virtualModuleRequestPath.pages);

  let resolvePendingChanges: (() => void) | undefined;

  type ChangedFiles = {
    filePaths: string | string[];
    action: 'add' | 'unlink';
  };

  let pendingChanges: ChangedFiles[] = [];
  let hasUnlinkedFile = false;

  const resolveNewPages = debounce(async () => {
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

    if (hasUnlinkedFile) {
      server.ws.send({ type: 'full-reload' });
    } else {
      // Need to emit all changes to ensure pages is hot updated on the client, so current page meta
      // is also hot updated.
      server.watcher.emit('change', virtualModuleRequestPath.pages);
    }

    hasUnlinkedFile = false;
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

  let prevRoutes;

  const isValidPagePath = (filePath: string) =>
    filePath.startsWith(app.dirs.pages.path);

  server.watcher
    .on('add', (filePath) => {
      if (!isValidPagePath(filePath)) return;
      handleChange({ filePaths: filePath, action: 'add' });
    })
    .on(
      'change',
      debounce(async (filePath) => {
        if (!isValidPagePath(filePath)) return;

        await resolvePendingChanges?.();

        await resolvePages(app, 'add', [
          resolveRelativePath(app.dirs.root.path, filePath),
        ]);

        const newRoutes = JSON.stringify(app.pages.map((page) => page.route));

        if (newRoutes !== prevRoutes) {
          server.watcher.emit('change', virtualModuleRequestPath.pages);
          setTimeout(() => {
            server.ws.send({ type: 'full-reload' });
          }, 100);
        }

        prevRoutes = newRoutes;
      }, 300),
    )
    .on('unlink', (filePath) => {
      if (!isValidPagePath(filePath)) return;

      hasUnlinkedFile = true;
      handleChange({ filePaths: filePath, action: 'unlink' });
    });

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

export function ssrPlugin(): Plugin {
  let app: App;

  return {
    name: '@vitebook/core:ssr',
    enforce: 'post',
    configureApp(_app) {
      app = _app;
    },
    transform(code, id, { ssr } = {}) {
      if (
        ssr &&
        !id.includes('@vitebook/core') && // Can't self-import.
        !id.includes('packages/core/dist-client') && // Linked package.
        id.endsWith('.svelte')
      ) {
        const mcs = new MagicString(code);
        const matchRE = /export\sdefault\s(.*?);/;
        const match = code.match(matchRE);
        const componentName = match?.[1];

        if (!match || !componentName) return null;

        const start = code.search(match[0]);
        const end = start + match[0].length;

        const addModuleCode = `  __vitebook__getSSRContext().modules.add(${JSON.stringify(
          app.dirs.root.relative(id),
        )})`;

        mcs.overwrite(
          start,
          end,
          [
            "import { getSSRContext as __vitebook__getSSRContext } from '@vitebook/core';",
            `const $$render = ${componentName}.$$render;`,
            `${componentName}.$$render = function(...args) {`,
            addModuleCode,
            '  return $$render(...args)',
            '}',
            '',
            match[0],
          ].join('\n'),
        );

        return {
          code: mcs.toString(),
          map: mcs.generateMap({ source: id }).toString(),
        };
      }

      return null;
    },
  };
}
