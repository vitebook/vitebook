import fs from 'fs';
import kleur from 'kleur';
import ora from 'ora';
import type { OutputAsset, OutputChunk, RollupOutput } from 'rollup';
import { ensureFile } from 'src/node/utils';

import {
  noendslash,
  noslash,
  ServerEntryModule,
  ServerPage,
  slash,
} from '../../../shared';
import { logger, LoggerIcon } from '../../utils/logger';
import type { App } from '../App';
import { readIndexHtmlFile } from '../middleware/indexHtml';
import { bundle } from './bundle';

export async function build(app: App): Promise<void> {
  const startTime = Date.now();
  const spinner = ora();

  logger.info(kleur.bold(kleur.cyan(`vitebook@${app.version}\n`)));

  if (app.pages.size === 0) {
    logger.info(kleur.bold(`❓ No pages were resolved\n`));
    return;
  }

  // Render pages
  spinner.start(kleur.bold(`Rendering ${app.pages.size} pages...`));

  try {
    const [clientBundle] = await bundle(app);

    const APP_CHUNK = clientBundle.output.find(
      (chunk) =>
        chunk.type === 'chunk' &&
        chunk.isEntry &&
        /^assets\/entry\./.test(chunk.fileName),
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

    const serverEntryPath = app.dirs.out.resolve('server', 'entry.cjs');

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { render } = require(serverEntryPath) as ServerEntryModule;

    const pages = app.pages.getPages();

    for (const page of pages) {
      const { ssr, html, head } = await render(page);

      const stylesheetLinks = [CSS_CHUNK?.fileName]
        .filter(Boolean)
        .map((fileName) => createLinkTag(app, 'stylesheet', fileName))
        .filter((tag) => tag.length > 0)
        .join('\n    ');

      const pageImports = resolvePageImports(
        app,
        page,
        clientBundle,
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

      const appScriptTag = `<script type="module" src="/${APP_CHUNK.fileName}" defer></script>`;

      const pageHtml = HTML_TEMPLATE.replace(`<!--@vitebook/head-->`, headTags)
        .replace(`<!--@vitebook/app-->`, html)
        .replace('<!--@vitebook/body-->', appScriptTag)
        .replace(
          '<script type="module" src="/:virtual/vitebook/client"></script>',
          '',
        );

      const decodedRoute = decodeURI(page.route);

      const filePath = decodedRoute.endsWith('/')
        ? `${decodedRoute}index.html`
        : decodedRoute;

      const outputPath = app.dirs.out.resolve(filePath.slice(1));

      await ensureFile(outputPath);
      await fs.promises.writeFile(outputPath, pageHtml);
    }

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

  spinner.stopAndPersist({
    symbol: LoggerIcon.Success,
    text: kleur.bold(`Rendered ${kleur.underline(app.pages.size)} pages`),
  });

  logRoutes(app);

  const endTime = ((Date.now() - startTime) / 1000).toFixed(2);

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

function logRoutes(app: App) {
  const logs: string[] = [''];

  app.pages.getPages().forEach((page) => {
    logs.push(
      kleur.white(
        `- ${noslash(
          page.route === '/' ? 'index.html' : decodeURI(page.route),
        )} ${kleur.dim(page.rootPath ? `(${noslash(page.rootPath)})` : '')}`,
      ),
    );
  });

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
  const baseUrl = noendslash('/');
  const href = `${baseUrl}${slash(fileName)}`;
  return `<link rel="${rel}" href="${href}">`;
}

function createPreloadTag(app: App, fileName?: string) {
  if (!fileName) return '';

  const baseUrl = noendslash('/');
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
  clientBundle: RollupOutput,
  appChunk: OutputChunk,
) {
  const pageChunk = clientBundle.output.find(
    (chunk) => chunk.type === 'chunk' && chunk.facadeModuleId === page.filePath,
  ) as OutputChunk;

  const layoutChunks = resolvePageLayoutChunks(app, page, clientBundle);

  return {
    imports: Array.from(
      new Set([
        ...appChunk.imports,
        ...layoutChunks.map((chunk) => chunk.imports).flat(),
        ...layoutChunks.map((chunk) => chunk.fileName),
        ...(pageChunk?.imports ?? []),
        pageChunk.fileName,
      ]),
    ),
    dynamicImports: Array.from(
      new Set([
        ...appChunk.dynamicImports.filter(
          (fileName) => !isPageChunk(clientBundle, fileName),
        ),
        ...layoutChunks.map((chunk) => chunk.dynamicImports).flat(),
        ...(pageChunk?.dynamicImports ?? []),
      ]),
    ),
  };
}

function resolvePageLayoutChunks(
  app: App,
  page: ServerPage,
  clientBundle: RollupOutput,
) {
  return page.layouts
    .map((i) => app.pages.getLayoutByIndex(i))
    .map((layout) => {
      if (!layout) return null;

      return clientBundle.output.find(
        (chunk) =>
          chunk.type === 'chunk' && chunk.facadeModuleId === layout.filePath,
      );
    })
    .filter(Boolean) as OutputChunk[];
}

const cache = new Map();
function isPageChunk(clientBundle: RollupOutput, fileName: string) {
  if (cache.has(fileName)) return cache.get(fileName);

  const is = clientBundle.output.find(
    (chunk) => chunk.type === 'chunk' && chunk.fileName === fileName,
  ) as OutputChunk;

  cache.set(fileName, is);
  return is;
}
