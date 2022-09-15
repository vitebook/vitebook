import fsp from 'fs/promises';
import kleur from 'kleur';
import type {
  Directory,
  PageFileRoute,
  RoutesLogLevel,
  RoutesLogStyle,
} from 'node';
import type { App } from 'node/app/App';
import { createDirectory } from 'node/app/create/app-dirs';
import {
  copyDir,
  copyFile,
  ensureDir,
  ensureFile,
  hash,
  logger,
  LoggerIcon,
  mkdirp,
  normalizePath,
  rimraf,
  trimExt,
} from 'node/utils';
import { readIndexHtmlFile } from 'node/vite/core';
import fs from 'node:fs';
import path from 'node:path';
import ora from 'ora';
import { STATIC_DATA_ASSET_BASE_PATH } from 'shared/data';
import { normalizeURL } from 'shared/routing';
import { escapeHTML } from 'shared/utils/html';
import { isString } from 'shared/utils/unit';
import {
  endslash,
  isLinkExternal,
  noendslash,
  noslash,
  slash,
} from 'shared/utils/url';

import { type BuildBundles, type BuildData } from '../build';
import { resolvePageChunks } from '../chunks';
import { crawl } from '../crawl';
import { logBadLinks, logRoutesList, logRoutesTree } from '../log';
import { buildSitemap } from '../sitemap';

export function getBuildAdapterUtils(
  app: App,
  bundles: BuildBundles,
  build: BuildData,
): BuildAdapterUtils {
  const baseURL = app.vite.resolved!.base;

  return {
    logger,
    icons: {
      info: LoggerIcon.Info,
      tip: LoggerIcon.Tip,
      success: LoggerIcon.Success,
      warn: LoggerIcon.Warn,
      error: LoggerIcon.Error,
    },
    color: kleur,
    crawl,
    hash,
    normalizePath,
    trimExt,
    normalizeURL,
    mkdirp,
    rimraf,
    copyFile,
    copyDir,
    ensureDir,
    ensureFile,
    noslash,
    slash,
    endslash,
    noendslash,
    readFile: (filePath) => fsp.readFile(filePath, 'utf-8'),
    writeFile: (filePath, fileContent) =>
      fsp.writeFile(filePath, fileContent, 'utf-8'),
    createFilesArray: () => [],
    writeFiles,
    isLinkExternal: (path) => isLinkExternal(path, baseURL),
    pluralize: (word, count) => (count === 1 ? word : `${word}s`),
    createSpinner: ora,
    resolveHTMLFilename: (url) => {
      const decodedRoute = decodeURI(isString(url) ? url : url.pathname);
      const filePath = decodedRoute.endsWith('/')
        ? `${decodedRoute}index.html`
        : decodedRoute;
      return noslash(filePath);
    },
    resolveDataFilename: (name) =>
      `${STATIC_DATA_ASSET_BASE_PATH}/${name}.json`.slice(1),
    resolvePageChunks: (route) => resolvePageChunks(app, route, bundles.client),
    buildSitemaps: async () => {
      if (app.config.sitemap.length === 0) return [];
      const sitemaps = app.config.sitemap
        .map((config) => buildSitemap(app, build.links, config))
        .filter(Boolean);
      return (await Promise.all(sitemaps)) as [string, string][];
    },
    createStaticDataScriptTag: (dataAssetIds) => {
      const table: Record<string, unknown> = {};

      for (const id of dataAssetIds) {
        const data = build.staticData.get(id)!;
        if (data && Object.keys(data.data).length > 0) {
          table[data.contentHash] = data.data;
        }
      }

      if (Object.keys(table).length === 0) return '';

      return [
        '<script>',
        `__VBK_STATIC_DATA__ = JSON.parse(${JSON.stringify(
          JSON.stringify(table),
        )});`,
        '</script>',
      ].join('');
    },
    createLinkTag: (rel, pathname) => createLinkTag(app, rel, pathname),
    createPreloadTag: (pathname) => createPreloadTag(app, pathname),
    createRedirectMetaTag: (url: string) =>
      `<meta http-equiv="refresh" content="${escapeHTML(`0;url=${url}`)}">`,
    guessPackageManager: () => guessPackageManager(app),
    findPreviewScriptName: () => findPreviewScriptName(app),
    logBadLinks: () => logBadLinks(build.badLinks),
    logRoutes: ({ level, style: logStyle } = {}) => {
      const style = logStyle ?? app.config.routes.log;
      if (style !== 'none') {
        const logger =
          style === 'list'
            ? logRoutesList
            : style === 'tree'
            ? logRoutesTree
            : style;

        logger({
          level: level ?? app.config.routes.logLevel,
          ...build,
        });
      }
    },
    escapeHTML,
    createDirectory,
    getHTMLTemplate: () => readIndexHtmlFile(app, { dev: false }),
  };
}

function createLinkTag(app: App, rel: string, fileName?: string) {
  if (!fileName) return '';
  const baseUrl = noendslash(app.vite.resolved!.base);
  const href = `${baseUrl}${slash(fileName)}`;
  return `<link rel="${rel}" href="${href}" />`;
}

function createPreloadTag(app: App, fileName?: string) {
  if (!fileName) return '';

  const baseUrl = noendslash(app.vite.resolved!.base);
  const href = `${baseUrl}${slash(fileName)}`;

  if (fileName.endsWith('.js')) {
    return `<link rel="modulepreload" crossorigin href="${href}" />`;
  } else if (fileName.endsWith('.css')) {
    return `<link rel="stylesheet" href="${href}" />`;
  } else if (fileName.endsWith('.woff')) {
    return ` <link rel="preload" href="${href}" as="font" type="font/woff" crossorigin />`;
  } else if (fileName.endsWith('.woff2')) {
    return ` <link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin />`;
  } else if (fileName.endsWith('.gif')) {
    return ` <link rel="preload" href="${href}" as="image" type="image/gif" />`;
  } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
    return ` <link rel="preload" href="${href}" as="image" type="image/jpeg" />`;
  } else if (fileName.endsWith('.png')) {
    return ` <link rel="preload" href="${href}" as="image" type="image/png" />`;
  }

  return '';
}

function guessPackageManager(app: App): 'npm' | 'yarn' | 'pnpm' {
  if (fs.existsSync(app.dirs.root.resolve('pnpm-lock.yaml'))) {
    return 'pnpm';
  }

  if (fs.existsSync(app.dirs.root.resolve('yarn.lock'))) {
    return 'yarn';
  }

  return 'npm';
}

async function findPreviewScriptName(app: App) {
  try {
    const packageJson = app.dirs.root.resolve('package.json');
    if (fs.existsSync(packageJson)) {
      const content = fs.readFileSync(packageJson, 'utf-8');
      const json = JSON.parse(content);

      const script = Object.keys(json.scripts ?? {}).find((script) => {
        return json.scripts[script].includes('vite preview');
      });

      return script;
    }
  } catch (e) {
    //
  }

  return null;
}

async function writeFiles(
  files: { filename: string; content: string }[],
  resolveFilePath: (filename: string) => string,
  resolvePendingMessage: (filesCount: string) => string,
  resolveSuccessMessage: (filesCount: string) => string,
) {
  const writingSpinner = ora();
  const filesCount = kleur.underline(files.length);
  const pendingMessage = resolvePendingMessage?.(filesCount);
  const successMessage = resolveSuccessMessage?.(filesCount);

  writingSpinner.start(kleur.bold(pendingMessage));

  await Promise.all(
    files.map(async ({ filename, content }) => {
      const filePath = normalizePath(resolveFilePath(filename));
      await ensureDir(path.posix.dirname(filePath));
      await fsp.writeFile(filePath, content);
    }),
  );

  writingSpinner.stopAndPersist({
    text: kleur.bold(successMessage),
    symbol: LoggerIcon.Success,
  });
}

export type BuildAdapterUtils = {
  logger: typeof logger;
  color: typeof kleur;
  icons: {
    info: string;
    tip: string;
    success: string;
    warn: string;
    error: string;
  };
  crawl(html: string): string[];
  hash(content: string): string;
  normalizePath(path: string): string;
  trimExt(path: string): string;
  normalizeURL(url: URL): URL;
  mkdirp(dirname: string): void;
  rimraf(dirname: string): void;
  readFile(filePath: string): Promise<string>;
  writeFile(filePath: string, fileContent: string): Promise<void>;
  createFilesArray(): { filename: string; content: string }[];
  writeFiles: (
    files: { filename: string; content: string }[],
    resolveFilePath: (filename: string) => string,
    resolvePendingMessage: (filesCount: string) => string,
    resolveSuccessMessage: (filesCount: string) => string,
  ) => Promise<void>;
  copyFile(src: string, dest: string): void;
  copyDir(src: string, dest: string): void;
  ensureFile(filePath: string): Promise<void>;
  ensureDir(dirname: string): Promise<void>;
  noslash(path: string): string;
  slash(path: string): string;
  endslash(path: string): string;
  noendslash(path: string): string;
  isLinkExternal(path: string): boolean;
  createSpinner: typeof ora;
  pluralize(word: string, count: number): string;
  resolveHTMLFilename(url: string | URL): string;
  resolveDataFilename(name: string): string;
  resolvePageChunks(route: PageFileRoute): {
    assets: string[];
    imports: string[];
    dynamicImports: string[];
  };
  buildSitemaps(): Promise<[filename: string, content: string][]>;
  createRedirectMetaTag(url: string): string;
  createLinkTag(rel: string, pathname: string): string;
  createPreloadTag(pathname: string): string;
  createStaticDataScriptTag(dataAssetIds: Set<string>): string;
  guessPackageManager(): 'npm' | 'pnpm' | 'yarn';
  findPreviewScriptName(): Promise<string | null | undefined>;
  logBadLinks: () => void;
  logRoutes(overrides?: {
    level?: RoutesLogLevel;
    style?: RoutesLogStyle;
  }): void;
  escapeHTML(content: string): string;
  createDirectory: (dirname: string) => Directory;
  getHTMLTemplate(): string;
};
