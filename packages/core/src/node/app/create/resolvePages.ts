import kleur from 'kleur';

import {
  ensureLeadingSlash,
  prettyJsonStr,
  removeLeadingSlash,
  ServerPage,
  stripImportQuotesFromJson,
} from '../../../shared';
import { globby, readRecentlyChangedFile } from '../../utils/fs';
import { logger } from '../../utils/logger';
import { path } from '../../utils/path';
import type { App } from '../App';
import type { Plugin } from '../plugin/Plugin';

const resolvedPages = new Map<string, ServerPage>();
const unresolvedPages = new Set<string>();
const pageResolvedBy = new Map<string, Plugin>();

export function resolvePageFilePaths(app: App): string[] {
  return globby.sync(app.options.include, {
    absolute: true,
    cwd: app.dirs.root.path,
  });
}

export async function resolvePages(
  app: App,
  action: 'add' | 'unlink' | 'change',
  changed?: string[],
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

  app.pages = filterDuplicateRoutes(
    sortPages(Array.from(resolvedPages.values())).map((page) => ({
      ...page,
      route: stripOrderFromRoute(page.route),
    })),
  );

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
    const relativeFilePath = app.dirs.root.relative(filePath);
    const fileContent = (await readRecentlyChangedFile(filePath)).toString();
    const route =
      app.options.resolveRoute?.({ filePath, relativeFilePath }) ??
      filePathToRoute(app, filePath, fileContent, true);

    const page = await plugin.resolvePage?.({
      id,
      filePath,
      relativeFilePath,
      route,
      read: () => readRecentlyChangedFile(filePath),
      env: app.env,
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
        route: page.route ?? route,
        rootPath: app.dirs.root.relative(filePath),
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
          path.relative(app.dirs.root.path, filePath),
      )}\n`,
    ),
  );

  unresolvedPages.add(filePath);
}

const FAKE_HOST = 'http://a.com';
const FRONTMATTER_RE = /^---(.|\s|\S)*?---/;
const MD_FILE_ROUTE_RE = /route:\s?(.*)/;
const FILE_ROUTE_RE = /export const __route = (?:'|")(.*?)(?:'|")/;

export function stripOrderFromRoute(route: string) {
  return route.replace(/\[\d*\]/g, '');
}

export function filePathToRoute(
  app: App,
  filePath: string,
  fileContent: string,
  keepOrder = false,
): string {
  const fileExt = path.extname(filePath);

  let configuredRoute;

  if (fileExt === '.md') {
    const frontmatter = fileContent.match(FRONTMATTER_RE)?.[0];
    if (frontmatter) configuredRoute = frontmatter.match(MD_FILE_ROUTE_RE)?.[1];
  } else {
    configuredRoute = fileContent.match(FILE_ROUTE_RE)?.[1];
  }

  if (configuredRoute && !configuredRoute.endsWith('.html')) {
    configuredRoute += '.html';
  }

  let route = configuredRoute ?? path.relative(app.dirs.src.path, filePath);
  route = keepOrder ? route : stripOrderFromRoute(route);

  const url = new URL(route.toLowerCase(), FAKE_HOST).pathname;

  return url
    .replace(new RegExp(`(.story)?(${fileExt})($|\\?)`, 'i'), '.html')
    .replace(/\/(README|index).html($|\?)/i, '/');
}

export function loadPagesVirtualModule(app: App): string {
  return `export default ${stripImportQuotesFromJson(
    prettyJsonStr(
      app.pages.map((page) => ({
        ...page,
        loader: `() => import('${page.id}')`,
        // Not included client-side.
        id: undefined,
        filePath: undefined,
      })),
    ),
  )}`;
}

export function filterDuplicateRoutes(pages: ServerPage[]): ServerPage[] {
  const seen = new Map();
  const filteredPages: ServerPage[] = [];

  for (const page of pages) {
    if (seen.has(page.route)) {
      const routeOwner = seen.get(page.route);

      const fileA = `${kleur.bold('Belongs To:')} ${routeOwner.rootPath}\n`;
      const fileB = `${kleur.bold('Duplicate (ignored):')} ${page.rootPath}\n`;

      logger.warn(
        logger.formatWarnMsg(
          `Found duplicate route: ${kleur.bold(
            page.route,
          )}\n\n${fileA}\n${fileB}`,
        ),
      );
    } else {
      seen.set(page.route, page);
      filteredPages.push(page);
    }
  }

  return filteredPages;
}

// Splits route by `/` and retain splitter.
const splitRouteRE = /(.*?\/)/g;
const splitRoute = (route: string) => route.split(splitRouteRE).slice(3);

const orderedPageTokenRE = /^\[(\d)\]/;

export function sortPages(pages: ServerPage[]): ServerPage[] {
  return Object.values(pages).sort((pageA, pageB) => {
    const tokensA = splitRoute(`<root>/${removeLeadingSlash(pageA.route)}`);
    const tokensB = splitRoute(`<root>/${removeLeadingSlash(pageB.route)}`);
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

      const tokenAOrderNo = tokensA[i].match(orderedPageTokenRE)?.[1];
      const tokenBOrderNo = tokensA[i].match(orderedPageTokenRE)?.[1];

      if (tokenAOrderNo && tokenBOrderNo) {
        return tokenAOrderNo < tokenBOrderNo ? -1 : 1;
      }

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
