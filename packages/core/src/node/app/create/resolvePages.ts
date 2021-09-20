import kleur from 'kleur';

import type { ServerPage } from '../../../shared/index.js';
import {
  ensureLeadingSlash,
  prettyJsonStr,
  stripImportQuotesFromJson
} from '../../../shared/index.js';
import { globby, readRecentlyChangedFile } from '../../utils/fs.js';
import { logger } from '../../utils/logger.js';
import { path } from '../../utils/path.js';
import type { App } from '../App.js';
import type { Plugin } from '../plugin/Plugin.js';

const resolvedPages = new Map<string, ServerPage>();
const unresolvedPages = new Set<string>();
const pageResolvedBy = new Map<string, Plugin>();

export function resolvePageFilePaths(app: App): string[] {
  return globby.sync(app.options.include, {
    absolute: true,
    cwd: app.dirs.root.path
  });
}

export async function resolvePages(
  app: App,
  action: 'add' | 'change' | 'unlink',
  changed?: string[]
): Promise<void> {
  const filePaths = changed ?? resolvePageFilePaths(app);

  if (action === 'unlink') {
    const removedPages: ServerPage[] = [];

    // Remove pages.
    for (let i = 0; i < filePaths.length; i += 1) {
      const filePath = filePaths[i];
      const page = resolvedPages.get(filePath);
      if (page) removedPages.push(page);
      resolvedPages.delete(filePath);
      unresolvedPages.delete(filePath);
      pageResolvedBy.delete(filePath);
    }

    // `pagesRemoved` hook
    for (let i = 0; i < app.plugins.length; i += 1) {
      await app.plugins[i].pagesRemoved?.(removedPages);
    }
  } else {
    // Attempt to resolve pages.
    for (let i = 0; i < filePaths.length; i += 1) {
      const filePath = filePaths[i];
      await resolvePage(app, filePath);
    }
  }

  app.pages = sortPages(Array.from(resolvedPages.values()));

  // `pagesResolved` hook
  for (let i = 0; i < app.plugins.length; i += 1) {
    // Pass fresh array to each plugin to avoid any funky mutations.
    await app.plugins[i].pagesResolved?.(Array.from(resolvedPages.values()));
  }
}

async function resolvePage(app: App, filePath: string): Promise<void> {
  for (let i = 0; i < app.plugins.length; i += 1) {
    const plugin = app.plugins[i];

    const id = ensureLeadingSlash(path.relative(app.dirs.root.path, filePath));
    const route = filePathToRoute(app, filePath);

    const page = await plugin.resolvePage?.({
      id,
      filePath,
      route,
      read: () => readRecentlyChangedFile(filePath),
      env: app.env
    });

    if (page) {
      const wasResolvedBy = pageResolvedBy.get(filePath);

      // If the page resolver changes we'll notify previous plugin to remove pages.
      if (wasResolvedBy && plugin !== wasResolvedBy) {
        const existingPage = resolvedPages.get(filePath);
        if (existingPage) {
          await wasResolvedBy.pagesRemoved?.([existingPage]);
        }
      }

      resolvedPages.set(filePath, {
        ...page,
        filePath,
        id: page.id ?? id,
        route: page.route ?? route
      });

      pageResolvedBy.set(filePath, plugin);
      unresolvedPages.delete(filePath);

      return;
    }
  }

  pageCouldNotBeResolved(app, filePath);
}

function pageCouldNotBeResolved(app: App, filePath: string) {
  if (unresolvedPages.has(filePath)) return;

  logger.warn(
    logger.formatWarnMsg(
      `No plugin could resolve page: ${kleur.bold(
        path.basename(app.dirs.root.path) +
          '/' +
          path.relative(app.dirs.root.path, filePath)
      )}`
    )
  );

  unresolvedPages.add(filePath);
}

// eslint-disable-next-line no-control-regex
const rControl = /[\u0000-\u001f]/g;
const rCombining = /[\u0300-\u036F]/g;
export function filePathToRoute(app: App, filePath: string): string {
  const relativePath = path.relative(app.dirs.src.path, filePath);
  return ensureLeadingSlash(relativePath)
    .normalize('NFKD')
    .replace(rCombining, '')
    .replace(rControl, '')
    .replace(new RegExp(`(${path.extname(filePath)})$`), '.html')
    .replace(/\/(README|index).html$/i, '/')
    .toLowerCase();
}

export function loadPagesVirtualModule(app: App): string {
  return `export default ${stripImportQuotesFromJson(
    prettyJsonStr(
      app.pages.map((page) => ({
        ...page,
        loader: `() => import('${page.id}')`,
        // Not included client-side.
        id: undefined,
        filePath: undefined
      }))
    )
  )}`;
}

// Splits route by `/` and retain splitter.
const splitRouteRE = /(.*?\/)/g;
const splitRoute = (route: string) => route.split(splitRouteRE).slice(3);

export function sortPages(pages: ServerPage[]): ServerPage[] {
  return Object.values(pages).sort((pageA, pageB) => {
    const tokensA = splitRoute(pageA.route);
    const tokensB = splitRoute(pageB.route);
    const len = Math.max(tokensA.length, tokensB.length);

    for (let i = 0; i < len; i++) {
      if (!(i in tokensA)) {
        return -1;
      }

      if (!(i in tokensB)) {
        return 1;
      }

      const tokenA = tokensA[i].toLowerCase();
      const tokenB = tokensB[i].toLowerCase();

      if (tokenA === tokenB) {
        continue;
      }

      const isTokenADir = tokenA[tokenA.length - 1] === '/';
      const isTokenBDir = tokenB[tokenB.length - 1] === '/';

      if (isTokenADir === isTokenBDir) {
        return tokenA < tokenB ? -1 : 1;
      } else {
        return isTokenADir ? 1 : -1;
      }
    }

    return 0;
  });
}