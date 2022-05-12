import fs from 'fs-extra';
import kleur from 'kleur';
import ora from 'ora';
import type { OutputAsset, OutputChunk, RollupOutput } from 'rollup';
import path from 'upath';

import {
  ensureLeadingSlash,
  removeEndingSlash,
  removeLeadingSlash,
  ServerEntryModule,
  ServerPage,
} from '../../../../shared';
import { logger, LoggerIcon } from '../../../utils/logger';
import type { App } from '../../App';
import { resolvePages } from '../../create/resolvePages';
import { readIndexHtmlFile } from '../middleware/indexHtml';
import { bundle } from './bundle';

export async function build(app: App): Promise<void> {
  const startTime = Date.now();
  const spinner = ora();

  logger.info(kleur.bold(kleur.cyan(`vitebook@${app.version}\n`)));

  // Resolve pages
  spinner.start(kleur.bold('Resolving pages...'));
  await resolvePages(app, 'add');
  spinner.stop();

  const includesHomePage = () => app.pages.find((page) => page.route === '/');

  if (app.pages.length === 0) {
    logger.info(kleur.bold(`❓ No pages were resolved\n`));
    return;
  }

  // Render pages
  spinner.start(
    kleur.bold(
      `Rendering ${app.pages.length + (includesHomePage() ? 0 : 1)} pages...`,
    ),
  );

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
      await fs.readFile(app.dirs.out.resolve('ssr-manifest.json'), 'utf-8'),
    );

    const serverEntryPath = app.dirs.out.resolve('server', 'entry.cjs');

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { render } = require(serverEntryPath) as ServerEntryModule;

    // Include home page so it's rendered (if not included).
    if (!includesHomePage()) {
      // @ts-expect-error - only the route is required
      app.pages.unshift({ route: '/' });
    }

    for (const page of app.pages) {
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

      const headTags = [head, stylesheetLinks, preloadLinks, prefetchLinks]
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
      const filePath = decodedRoute === '/' ? '/index.html' : decodedRoute;
      const outputPath = app.dirs.out.resolve(filePath.slice(1));

      await fs.ensureFile(outputPath);
      await fs.writeFile(outputPath, pageHtml);
    }

    if (!app.env.isDebug) {
      await fs.remove(app.dirs.out.resolve('server'));
      await fs.unlink(app.dirs.out.resolve('ssr-manifest.json'));
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
    text: kleur.bold(`Rendered ${kleur.underline(app.pages.length)} pages`),
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

  app.pages.forEach((page) => {
    logs.push(
      kleur.white(
        `- ${removeLeadingSlash(
          page.route === '/' ? 'index.html' : decodeURI(page.route),
        )} ${kleur.dim(
          page.rootPath ? `(${removeLeadingSlash(page.rootPath)})` : '',
        )}`,
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
  const baseUrl = removeEndingSlash('/');
  const href = `${baseUrl}${ensureLeadingSlash(fileName)}`;
  return `<link rel="${rel}" href="${href}">`;
}

function createPreloadTag(app: App, fileName?: string) {
  if (!fileName) return '';

  const base = removeEndingSlash('/');
  const href = `${base}${ensureLeadingSlash(fileName)}`;

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
      imports.add(removeLeadingSlash(file));
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
  const srcPath = fs.realpathSync(
    path.resolve(app.dirs.root.path, page.rootPath ?? ''),
  );

  const pageChunk = clientBundle.output.find(
    (chunk) => chunk.type === 'chunk' && chunk.facadeModuleId === srcPath,
  ) as OutputChunk;

  return {
    imports: Array.from(
      new Set([
        ...appChunk.imports,
        ...(pageChunk?.imports ?? []),
        pageChunk.fileName,
      ]),
    ),
    dynamicImports: Array.from(
      new Set([
        ...appChunk.dynamicImports.filter(
          (fileName) => !isPageChunk(clientBundle, fileName),
        ),
        ...(pageChunk?.dynamicImports ?? []),
      ]),
    ),
  };
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
