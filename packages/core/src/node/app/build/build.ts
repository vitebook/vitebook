import { createHash } from 'crypto';
import fs from 'fs';
import kleur from 'kleur';
import ora from 'ora';
import type { OutputAsset, OutputBundle, OutputChunk } from 'rollup';
import path from 'upath';

import {
  cleanRoutePath,
  DATA_ASSET_BASE_URL,
  escapeHTML,
  isLinkExternal,
  isString,
  isUndefined,
  matchRouteInfo,
  noendslash,
  normalizeURL,
  noslash,
  type ServerEntryModule,
  type ServerLoadedOutputMap,
  type ServerPage,
  slash,
} from '../../../shared';
import { ensureFile, rimraf } from '../../utils';
import { LoggerIcon } from '../../utils/logger';
import type { App } from '../App';
import {
  buildDataScriptTag,
  buildServerLoadedDataMap,
  loadPageServerOutput,
  readIndexHtmlFile,
} from '../plugins/core';
import { installFetch } from '../polyfills';
import { resolvePageImports } from './chunks';
import { log404, logRoutesList, logRoutesTree } from './log';
import { buildSitemap } from './sitemap';

export async function build(
  app: App,
  clientBundle: OutputBundle,
): Promise<void> {
  installFetch();

  app.logger.info(kleur.bold(`vitebook@${app.version}`));

  if (app.pages.size === 0) {
    console.log(kleur.bold(`❓ No pages were resolved`));
    return;
  }

  const startTime = Date.now();
  const spinner = ora();

  const baseUrl = app.vite.resolved!.base;
  const pages = app.pages.all;

  const appEntries = app.entries();
  const appEntryFilenames = Object.keys(appEntries);

  const hrefRE = /href="(.*?)"/g;
  const seenLinks = new Map<string, ServerPage>();
  const notFoundLinks = new Set<string>();
  const redirects: Record<string, string> = {};
  const dataHashes: Record<string, string> = {};
  const serverOutput: Map<string, string | ServerLoadedOutputMap> = new Map();
  const outputFiles: [filePath: string, content: string][] = [];

  const chunks: OutputChunk[] = [];
  const assets: OutputAsset[] = [];

  for (const value of Object.values(clientBundle)) {
    if (value.type === 'asset') {
      assets.push(value);
    } else {
      chunks.push(value);
    }
  }

  try {
    const ENTRY_CHUNK = chunks.find(
      (chunk) => chunk.isEntry && /^entry-/.test(chunk.fileName),
    )!;

    const APP_CHUNK = chunks.find(
      (chunk) => chunk.isEntry && /^app-/.test(chunk.fileName),
    )!;

    const CSS_CHUNK = assets.find((asset) => asset.fileName.endsWith('.css'))!;

    const HTML_TEMPLATE = readIndexHtmlFile(app, { dev: false });

    const SSR_MANIFEST = JSON.parse(
      await fs.promises.readFile(
        app.dirs.out.resolve('ssr-manifest.json'),
        'utf-8',
      ),
    );

    // -------------------------------------------------------------------------------------------
    // LOAD DATA
    // -------------------------------------------------------------------------------------------

    const specialCharsRE = /\$|#|\[|\]|{|}|:/g;

    // eslint-disable-next-line no-inner-declarations
    async function loadServerOutput(url: URL, page: ServerPage) {
      const pathname = normalizeURL(url).pathname;

      if (serverOutput.has(pathname)) {
        return serverOutput.get(pathname)!;
      }

      const { output, redirect } = await loadPageServerOutput(
        url,
        app,
        page,
        (filePath) => {
          const path = app.dirs.out.resolve(
            'server',
            `${appEntryFilenames
              .find((name) => appEntries[name] === filePath)
              ?.replace(specialCharsRE, '_')}.js`,
          );

          return require(path);
        },
      );

      if (redirect) {
        const pathname = normalizeURL(url).pathname;
        redirects[pathname] = redirect;
        serverOutput.set(pathname, redirect);
        return redirect;
      }

      for (const id of output.keys()) {
        const data = output.get(id)!.data ?? {};
        const content = JSON.stringify(data);

        if (content !== '{}') {
          const hash = createHash('sha1')
            .update(content)
            .digest('hex')
            .substring(0, 8);

          dataHashes[id] = hash;

          outputFiles.push([
            path.join(app.dirs.out.path, `${DATA_ASSET_BASE_URL}/${hash}.json`),
            content,
          ]);
        }
      }

      serverOutput.set(pathname, output);
      return output;
    }

    // -------------------------------------------------------------------------------------------
    // RENDER
    // -------------------------------------------------------------------------------------------

    spinner.start(kleur.bold(`Rendering ${app.pages.size} pages...`));

    const serverEntryPath = app.dirs.out.resolve('server', 'entry.js');

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { render } = (await import(serverEntryPath)) as ServerEntryModule;

    const validPathname = /(\/|\.html)$/;

    // eslint-disable-next-line no-inner-declarations
    async function buildPage(url: URL, page: ServerPage) {
      const pathname = normalizeURL(url).pathname;

      if (seenLinks.has(pathname) || notFoundLinks.has(pathname)) {
        return;
      }

      if (!validPathname.test(pathname)) {
        log404(url.pathname, page, 'Found malformed URL pathname.');
        notFoundLinks.add(pathname);
        return;
      }

      seenLinks.set(pathname, page);

      const serverLoadedOutput = await loadServerOutput(url, page);

      // Redirect.
      if (isString(serverLoadedOutput)) {
        const location = serverLoadedOutput;

        const html = `<meta http-equiv="refresh" content="${escapeHTML(
          `0;url=${location}`,
        )}">`;

        outputFiles.push([getHTMLFilePath(url), html]);

        await buildPageFromHref(page, location);

        return;
      }

      const serverData = buildServerLoadedDataMap(serverLoadedOutput);
      const { ssr, html, head } = await render(url, { data: serverData });

      const stylesheetLinks = [CSS_CHUNK?.fileName]
        .filter(Boolean)
        .map((fileName) => createLinkTag(app, 'stylesheet', fileName))
        .filter((tag) => tag.length > 0)
        .join('\n    ');

      const pageImports = resolvePageImports(
        app,
        page,
        chunks,
        ENTRY_CHUNK,
        APP_CHUNK,
      );

      const manifestImports = resolveImportsFromManifest(
        ssr.modules,
        SSR_MANIFEST,
      );

      const preloadLinks = Array.from(
        new Set([...pageImports.imports, ...manifestImports]),
      )
        .map((fileName) => createPreloadTag(app, fileName))
        .join('\n    ');

      const prefetchLinks = pageImports.dynamicImports
        .map((fileName) => createLinkTag(app, 'prefetch', fileName))
        .join('\n    ');

      const headTags = [
        head ?? '',
        stylesheetLinks,
        preloadLinks,
        prefetchLinks,
      ]
        .filter((t) => t.length > 0)
        .join('\n    ');

      const appScriptTag = `<script type="module" src="/${ENTRY_CHUNK.fileName}" defer></script>`;

      const dataScriptTag = buildDataScriptTag(serverData, dataHashes);

      const dataHashScriptTag = `<script id="__VBK_DATA_HASH_MAP__">window.__VBK_DATA_HASH_MAP__ = __VBK_DATA__;</script>`;
      const redirectsScriptTag = `<script id="__VBK_REDIRECTS_MAP__">window.__VBK_REDIRECTS_MAP__ = __VBK_REDIRECTS__;</script>`;

      const pageHtml = HTML_TEMPLATE.replace(`<!--@vitebook/head-->`, headTags)
        .replace(`<!--@vitebook/app-->`, html)
        .replace(
          '<!--@vitebook/body-->',
          redirectsScriptTag + dataHashScriptTag + dataScriptTag + appScriptTag,
        )
        .replace(
          '<script type="module" src="/:virtual/vitebook/client"></script>',
          '',
        );

      outputFiles.push([getHTMLFilePath(url), pageHtml]);

      await crawlHtml(page, html);
    }

    // eslint-disable-next-line no-inner-declarations
    function getHTMLFilePath(url: URL) {
      const decodedRoute = decodeURI(url.pathname);

      const filePath = decodedRoute.endsWith('/')
        ? `${decodedRoute}index.html`
        : decodedRoute;

      return app.dirs.out.resolve(filePath.slice(1));
    }

    const notFoundRE = /\/404\./;
    // eslint-disable-next-line no-inner-declarations
    async function crawlHtml(page: ServerPage, html: string) {
      // Attempt to crawl for additional links.
      for (let href of html.match(hrefRE) ?? []) {
        href = href.slice(6, -1);
        await buildPageFromHref(page, href);
      }
    }

    // eslint-disable-next-line no-inner-declarations
    async function buildPageFromHref(page: ServerPage, href: string) {
      if (href.startsWith('#') || isLinkExternal(href, baseUrl)) return;

      const url = new URL(`http://ssr${slash(href)}`);
      const pathname = normalizeURL(url).pathname;

      if (seenLinks.has(pathname) || notFoundLinks.has(pathname)) return;

      const { index } = matchRouteInfo(url, app.pages.all) ?? {};
      const foundPage =
        !isUndefined(index) && index >= 0 ? app.pages.all[index] : null;

      if (foundPage && !notFoundRE.test(foundPage.id)) {
        await buildPage(url, foundPage);
        return;
      }

      if (notFoundLinks.size === 0) console.log();
      log404(url.pathname, page);
      notFoundLinks.add(pathname);
    }

    // Start with static paths and then crawl additional links.
    for (const page of pages.filter((page) => !page.route.dynamic).reverse()) {
      await buildPage(
        new URL(`http://ssr${cleanRoutePath(page.route.pathname)}`),
        page,
      );
    }

    for (const entry of app.config.routes.entries) {
      const url = new URL(`http://ssr${slash(entry)}`);
      const { index } = matchRouteInfo(url, app.pages.all) ?? {};

      if (index) {
        const page = app.pages.all[index];
        await buildPage(url, page);
      } else {
        app.logger.warn(
          `${kleur.bold('(404)')} No matching route for entry ${kleur.underline(
            entry,
          )}.`,
        );
      }
    }

    spinner.stopAndPersist({
      symbol: LoggerIcon.Success,
      text: kleur.bold(`Rendered ${kleur.underline(seenLinks.size)} pages`),
    });

    // -------------------------------------------------------------------------------------------
    // WRITE OUTPUT
    // -------------------------------------------------------------------------------------------

    spinner.start(`Writing files...`);

    const prodDataHashes: Record<string, string> = {};
    for (const id of Object.keys(dataHashes)) {
      const hashedId = createHash('sha1')
        .update(id)
        .digest('hex')
        .substring(0, 8);

      prodDataHashes[hashedId] = dataHashes[id];
    }

    const dataInsertRE = /__VBK_DATA__/;
    const dataHashTableString = JSON.stringify(prodDataHashes);

    const redirectsInsertRE = /__VBK_REDIRECTS__/;
    const redirectsString = JSON.stringify(redirects);

    await Promise.all(
      outputFiles.map(async ([filePath, fileContent]) => {
        if (filePath.endsWith('.html')) {
          fileContent = fileContent
            .replace(dataInsertRE, dataHashTableString)
            .replace(redirectsInsertRE, redirectsString);
        }

        await ensureFile(filePath);
        await fs.promises.writeFile(filePath, fileContent);
      }),
    );

    if (app.config.sitemap.length > 0) {
      await Promise.all(
        app.config.sitemap.map((config) =>
          buildSitemap(app, seenLinks, config),
        ),
      );
    }

    spinner.stopAndPersist({
      symbol: LoggerIcon.Success,
      text: kleur.bold(`Committed files`),
    });

    // -------------------------------------------------------------------------------------------
    // CLEAN + LOG
    // -------------------------------------------------------------------------------------------

    if (!app.config.isDebug) {
      rimraf(app.dirs.out.resolve('server'));
      rimraf(app.dirs.out.resolve('ssr-manifest.json'));
    }
  } catch (e) {
    spinner.stopAndPersist({
      symbol: LoggerIcon.Error,
    });
    throw e;
  } finally {
    // ...
  }

  const endTime = ((Date.now() - startTime) / 1000).toFixed(2);

  const routesLogStyle = app.config.routes.log;
  if (routesLogStyle !== 'none') {
    const input = {
      level: app.config.routes.logLevel,
      links: seenLinks,
      redirects,
      dataHashes,
      notFoundLinks,
      serverOutput,
    };

    const logger =
      routesLogStyle === 'list'
        ? logRoutesList
        : routesLogStyle === 'tree'
        ? logRoutesTree
        : routesLogStyle;

    logger(input);
  }

  const speedIcon = {
    2: '🤯',
    4: '🏎️',
    6: '🏃',
    10: '🐌',
    Infinity: '⚰️',
  };

  app.logger.success(
    kleur.bold(
      `Build complete in ${kleur.bold(kleur.underline(`${endTime}s`))} ${
        speedIcon[Object.keys(speedIcon).find((t) => endTime <= t)!]
      }`,
    ),
  );

  const pkgManager = guessPackageManager(app);
  const previewCommand = await findPreviewScriptName(app);
  console.log(
    kleur.bold(
      `⚡ ${
        previewCommand
          ? `Run \`${
              pkgManager === 'npm' ? 'npm run' : pkgManager
            } ${previewCommand}\` to serve production build`
          : 'Ready for preview'
      }\n`,
    ),
  );
}

function createLinkTag(app: App, rel: string, fileName?: string) {
  if (!fileName) return '';
  const baseUrl = noendslash(app.vite.resolved!.base);
  const href = `${baseUrl}${slash(fileName)}`;
  return `<link rel="${rel}" href="${href}">`;
}

function createPreloadTag(app: App, fileName?: string) {
  if (!fileName) return '';

  const baseUrl = noendslash(app.vite.resolved!.base);
  const href = `${baseUrl}${slash(fileName)}`;

  if (fileName.endsWith('.js')) {
    return `<link rel="modulepreload" crossorigin href="${href}">`;
  } else if (fileName.endsWith('.css')) {
    return `<link rel="stylesheet" href="${href}">`;
  } else if (fileName.endsWith('.woff')) {
    return ` <link rel="preload" href="${href}" as="font" type="font/woff" crossorigin>`;
  } else if (fileName.endsWith('.woff2')) {
    return ` <link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin>`;
  } else if (fileName.endsWith('.gif')) {
    return ` <link rel="preload" href="${href}" as="image" type="image/gif">`;
  } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
    return ` <link rel="preload" href="${href}" as="image" type="image/jpeg">`;
  } else if (fileName.endsWith('.png')) {
    return ` <link rel="preload" href="${href}" as="image" type="image/png">`;
  }

  return '';
}

function resolveImportsFromManifest(
  modules: Set<string>,
  manifest: Record<string, string[]>,
) {
  const imports = new Set<string>();

  for (const filename of modules) {
    manifest[filename]?.forEach((file) => {
      imports.add(noslash(file));
    });
  }

  return Array.from(imports);
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

async function findPreviewScriptName(app: App): Promise<string | undefined> {
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

  return undefined;
}
