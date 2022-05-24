import { createHash } from 'crypto';
import fs from 'fs';
import kleur from 'kleur';
import ora from 'ora';
import type { OutputAsset, OutputChunk, RollupOutput } from 'rollup';
import path from 'upath';

import {
  DATA_ASSET_BASE_URL,
  noendslash,
  noslash,
  type ServerContext,
  type ServerEntryModule,
  type ServerPage,
  slash,
} from '../../../shared';
import { ensureFile } from '../../utils';
import { logger, LoggerIcon } from '../../utils/logger';
import type { App } from '../App';
import { installFetch } from '../installFetch';
import { buildDataLoaderScriptTag, loadPageDataMap } from '../loader';
import { readIndexHtmlFile } from '../plugins/core';
import { bundle, getAppBundleEntries } from './bundle';

export async function build(app: App): Promise<void> {
  installFetch();

  logger.info(kleur.bold(kleur.cyan(`\nvitebook@${app.version}\n`)));

  if (app.pages.size === 0) {
    logger.info(kleur.bold(`❓ No pages were resolved\n`));
    return;
  }

  const startTime = Date.now();
  const spinner = ora();

  const appEntries = getAppBundleEntries(app);
  const appEntryFilenames = Object.keys(appEntries);

  const pages = app.pages.getPages();
  const outputFiles: [filePath: string, content: string][] = [];
  const pageData: WeakMap<ServerPage, ServerContext['data']> = new WeakMap();
  const dataHashTable: Record<string, string> = {};

  try {
    // -------------------------------------------------------------------------------------------
    // BUNDLE
    // -------------------------------------------------------------------------------------------

    const bundleStartTime = Date.now();
    spinner.start(kleur.bold('Bundling application...'));

    const [clientBundle] = await bundle(app);

    const ENTRY_CHUNK = clientBundle.output.find(
      (chunk) =>
        chunk.type === 'chunk' &&
        chunk.isEntry &&
        /^assets\/entry\./.test(chunk.fileName),
    ) as OutputChunk;

    const APP_CHUNK = clientBundle.output.find(
      (chunk) =>
        chunk.type === 'chunk' &&
        chunk.isEntry &&
        /^assets\/app\./.test(chunk.fileName),
    ) as OutputChunk;

    const CSS_CHUNK = clientBundle.output.find(
      (chunk) => chunk.type === 'asset' && chunk.fileName.endsWith('.css'),
    ) as OutputAsset;

    const HTML_TEMPLATE = readIndexHtmlFile(app, { dev: false });

    const SSR_MANIFEST = JSON.parse(
      await fs.promises.readFile(
        app.dirs.out.resolve('ssr-manifest.json'),
        'utf-8',
      ),
    );

    const bundleEndTime = ((Date.now() - bundleStartTime) / 1000).toFixed(2);
    spinner.stopAndPersist({
      symbol: LoggerIcon.Success,
      text: kleur.bold(
        `Bundled application in ${kleur.underline(`${bundleEndTime}s`)}`,
      ),
    });

    // -------------------------------------------------------------------------------------------
    // LOAD DATA
    // -------------------------------------------------------------------------------------------

    spinner.start(kleur.bold('Loading data...'));

    const loadStartTime = Date.now();

    await Promise.all(
      pages.map(async (page) => {
        const data = await loadPageDataMap(app, page, (filePath) => {
          const path = app.dirs.out.resolve(
            'server',
            `${appEntryFilenames.find(
              (name) => appEntries[name] === filePath,
            )}.cjs`,
          );

          return require(path);
        });

        for (const key of data.keys()) {
          const content = JSON.stringify(data.get(key)!);

          if (content !== '{}') {
            const hash = createHash('sha1')
              .update(content)
              .digest('hex')
              .substring(0, 8);

            dataHashTable[key] = hash;

            outputFiles.push([
              path.join(
                app.dirs.out.path,
                `${DATA_ASSET_BASE_URL}/${hash}.json`,
              ),
              content,
            ]);
          }
        }

        pageData.set(page, data);
      }),
    );

    const dataHashTableString = JSON.stringify(dataHashTable);

    const loadEndTime = ((Date.now() - loadStartTime) / 1000).toFixed(2);
    spinner.stopAndPersist({
      symbol: LoggerIcon.Success,
      text: kleur.bold(`Loaded data in ${kleur.underline(`${loadEndTime}s`)}`),
    });

    // -------------------------------------------------------------------------------------------
    // RENDER
    // -------------------------------------------------------------------------------------------

    spinner.start(kleur.bold(`Rendering ${app.pages.size} pages...`));

    const serverEntryPath = app.dirs.out.resolve('server', 'entry.cjs');

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { render } = require(serverEntryPath) as ServerEntryModule;

    for (const page of pages) {
      const data = pageData.get(page) ?? new Map();

      const { ssr, html, head } = await render(page, { data });

      const stylesheetLinks = [CSS_CHUNK?.fileName]
        .filter(Boolean)
        .map((fileName) => createLinkTag(app, 'stylesheet', fileName))
        .filter((tag) => tag.length > 0)
        .join('\n    ');

      const pageImports = resolvePageImports(
        app,
        page,
        clientBundle,
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

      const dataScriptTag = buildDataLoaderScriptTag(data, dataHashTable);

      const dataHashScriptTag = `<script>window.__VBK_DATA_HASH_MAP__ = ${dataHashTableString};</script>`;

      const pageHtml = HTML_TEMPLATE.replace(`<!--@vitebook/head-->`, headTags)
        .replace(`<!--@vitebook/app-->`, html)
        .replace(
          '<!--@vitebook/body-->',
          dataHashScriptTag + dataScriptTag + appScriptTag,
        )
        .replace(
          '<script type="module" src="/:virtual/vitebook/client"></script>',
          '',
        );

      const decodedRoute = decodeURI(page.route);

      const filePath = decodedRoute.endsWith('/')
        ? `${decodedRoute}index.html`
        : decodedRoute;

      const pageHtmlFilePath = app.dirs.out.resolve(filePath.slice(1));

      outputFiles.push([pageHtmlFilePath, pageHtml]);
    }

    spinner.stopAndPersist({
      symbol: LoggerIcon.Success,
      text: kleur.bold(`Rendered ${kleur.underline(app.pages.size)} pages`),
    });

    // -------------------------------------------------------------------------------------------
    // WRITE OUTPUT
    // -------------------------------------------------------------------------------------------

    spinner.start(`Writing HTML and JSON files...`);

    await Promise.all(
      outputFiles.map(async ([filePath, fileContent]) => {
        await ensureFile(filePath);
        await fs.promises.writeFile(filePath, fileContent);
      }),
    );

    spinner.stopAndPersist({
      symbol: LoggerIcon.Success,
      text: kleur.bold(`Written files`),
    });

    // -------------------------------------------------------------------------------------------
    // CLEAN UP
    // -------------------------------------------------------------------------------------------

    if (!app.env.isDebug) {
      await fs.promises.rm(app.dirs.out.resolve('server'), {
        recursive: true,
        force: true,
      });

      await fs.promises.unlink(app.dirs.out.resolve('ssr-manifest.json'));
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

  logRoutes(app, pageData, dataHashTable);

  const speedIcon = {
    2: '🤯',
    4: '🏎️',
    6: '🏃',
    10: '🐌',
    Infinity: '⚰️',
  };

  logger.success(
    kleur.bold(
      `${LoggerIcon.Success} Build complete in ${kleur.bold(
        kleur.underline(`${endTime}s`),
      )} ${speedIcon[Object.keys(speedIcon).find((t) => endTime <= t)!]}`,
    ),
  );

  const pkgManager = guessPackageManager(app);
  const previewCommand = await findPreviewScriptName(app);
  logger.success(
    kleur.bold(
      `\n⚡ ${
        previewCommand
          ? `Run \`${
              pkgManager === 'npm' ? 'npm run' : pkgManager
            } ${previewCommand}\` to serve production build`
          : 'Ready for preview'
      }\n`,
    ),
  );
}

export function logRoutes(
  app: App,
  pageData?: WeakMap<ServerPage, ServerContext['data']>,
  dataHashTable?: Record<string, string>,
) {
  const logs: string[] = ['', kleur.bold(kleur.underline('ROUTES')), ''];

  for (const page of app.pages.getPages()) {
    logs.push(
      kleur.white(
        `- ${noslash(
          page.route === '/' ? 'index.html' : decodeURI(page.route),
        )} ${kleur.dim(
          page.rootPath
            ? `(${noslash(app.dirs.pages.relative(page.rootPath))})`
            : '',
        )}`,
      ),
    );

    if (pageData && dataHashTable) {
      const data = pageData.get(page);

      if (data && data.size > 0) {
        for (const id of data.keys()) {
          const hashedId = dataHashTable[id];
          if (hashedId) {
            const file = app.dirs.pages.relative(
              id.split('/')[0].replace(/_/g, '/'),
            );

            logs.push(
              kleur.dim(
                `  - [${hashedId}] ${file} ${kleur.underline(
                  humanReadableFileSize(
                    Buffer.byteLength(JSON.stringify(data.get(id))!, 'utf8'),
                  ),
                )}`,
              ),
            );
          }
        }
      }
    }
  }

  logger.info(logs.join('\n'), '\n');
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
        return json.scripts[script].includes('vitebook preview');
      });

      return script;
    }
  } catch (e) {
    //
  }

  return undefined;
}

function createLinkTag(app: App, rel: string, fileName?: string) {
  if (!fileName) return '';
  const baseUrl = noendslash(app.vite?.config.base ?? '/');
  const href = `${baseUrl}${slash(fileName)}`;
  return `<link rel="${rel}" href="${href}">`;
}

function createPreloadTag(app: App, fileName?: string) {
  if (!fileName) return '';

  const baseUrl = noendslash(app.vite?.config.base ?? '/');
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

function resolvePageImports(
  app: App,
  page: ServerPage,
  bundle: RollupOutput,
  entryChunk: OutputChunk,
  appChunk: OutputChunk,
) {
  const pageChunk = bundle.output.find(
    (chunk) => chunk.type === 'chunk' && chunk.facadeModuleId === page.filePath,
  ) as OutputChunk;

  const layoutChunks = resolvePageLayoutChunks(app, page, bundle);

  return {
    imports: Array.from(
      new Set([
        ...entryChunk.imports.filter((i) => i !== appChunk.fileName),
        ...appChunk.imports,
        ...layoutChunks.map((chunk) => chunk.imports).flat(),
        appChunk.fileName,
        ...layoutChunks.map((chunk) => chunk.fileName),
        ...(pageChunk?.imports ?? []),
        pageChunk.fileName,
      ]),
    ),
    dynamicImports: Array.from(
      new Set([
        ...[entryChunk, appChunk]
          .map((chunk) =>
            chunk.dynamicImports.filter(
              (fileName) => !isPageChunk(fileName, bundle),
            ),
          )
          .flat(),
        ...layoutChunks.map((chunk) => chunk.dynamicImports).flat(),
        ...(pageChunk?.dynamicImports ?? []),
      ]),
    ),
  };
}

function resolveChunkByFilePath(filePath: string, bundle: RollupOutput) {
  return bundle.output.find(
    (chunk) => chunk.type === 'chunk' && chunk.facadeModuleId === filePath,
  ) as OutputChunk;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function resolvePageChunk(page: ServerPage, bundle: RollupOutput) {
  return resolveChunkByFilePath(page.filePath, bundle);
}

function resolvePageLayoutChunks(
  app: App,
  page: ServerPage,
  bundle: RollupOutput,
) {
  return page.layouts
    .map((i) => app.pages.getLayoutByIndex(i))
    .map((layout) => resolveChunkByFilePath(layout!.filePath, bundle))
    .filter(Boolean) as OutputChunk[];
}

const cache = new Map();
function isPageChunk(fileName: string, bundle: RollupOutput) {
  if (cache.has(fileName)) return cache.get(fileName);

  const is = bundle.output.find(
    (chunk) => chunk.type === 'chunk' && chunk.fileName === fileName,
  ) as OutputChunk;

  cache.set(fileName, !!is);
  return is;
}

/**
 * @see {@link https://stackoverflow.com/a/14919494}
 */
function humanReadableFileSize(bytes, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + 'B';
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + ' ' + units[u];
}
