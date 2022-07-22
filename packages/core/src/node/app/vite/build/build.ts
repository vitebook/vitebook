import kleur from 'kleur';
import ora from 'ora';
import type { OutputAsset, OutputChunk, RollupOutput } from 'rollup';

import {
  ensureLeadingSlash,
  HeadAttrsConfig,
  HeadConfig,
  removeEndingSlash,
  removeLeadingSlash,
  ServerEntryModule,
  ServerPage,
  SiteOptions,
} from '../../../../shared';
import { fs, path } from '../../../utils';
import { logger, LoggerIcon } from '../../../utils/logger';
import type { App } from '../../App';
import { resolvePages } from '../../create/resolvePages';
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
      (chunk) => chunk.type === 'chunk' && chunk.isEntry,
    ) as OutputChunk;

    const CSS_CHUNK = clientBundle.output.find(
      (chunk) => chunk.type === 'asset' && chunk.fileName.endsWith('.css'),
    ) as OutputAsset;

    const HTML_TEMPLATE = (
      await fs.readFile(app.dirs.config.resolve('index.html'), 'utf-8')
    ).replace('{{ version }}', app.version);

    const SSR_MANIFEST = JSON.parse(
      await fs.readFile(app.dirs.out.resolve('ssr-manifest.json'), 'utf-8'),
    );

    const serverEntryPath = app.dirs.out.resolve('server', 'entry-server.js');

    await fs.rename(
      app.dirs.out.resolve(
        'server',
        path.changeExt(path.basename(app.client.entry.server), 'js'),
      ),
      serverEntryPath,
    );

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { render } = (await import(
      app.dirs.out.resolve('server', serverEntryPath)
    )) as ServerEntryModule;

    // Include home page so it's rendered (if not included).
    if (!includesHomePage()) {
      // @ts-expect-error - only the route is required
      app.pages.unshift({ route: '/' });
    }

    for (const page of app.pages) {
      const { context, html, head } = await render(page);

      const stylesheetLinks = [CSS_CHUNK.fileName]
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
        context.modules,
        SSR_MANIFEST,
      );

      const preloadLinks = Array.from(
        new Set([...manifestImports, ...pageImports.imports]),
      )
        .map((fileName) => createPreloadTag(app, fileName))
        .join('\n    ');

      const prefetchLinks = pageImports.dynamicImports
        .map((fileName) => createLinkTag(app, 'prefetch', fileName))
        .join('\n    ');

      const headTags = [
        addSocialTags(app.site.options, page, context.head)
          .map(renderHeadTag)
          .join('\n   '),
        head,
        stylesheetLinks,
        preloadLinks,
        prefetchLinks,
      ]
        .filter((t) => t.length > 0)
        .join('\n    ');

      const appScriptTag = `<script type="module" src="${app.site.options.baseUrl}${APP_CHUNK.fileName}" defer></script>`;

      const pageHtml = HTML_TEMPLATE.replace('{{ lang }}', context.lang)
        .replace(`<!--@vitebook/head-->`, headTags)
        .replace(`<!--@vitebook/app-->`, html)
        .replace('<!--@vitebook/body-->', appScriptTag);

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
      const content = (await fs.readFile(packageJson)).toString();
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
  const base = removeEndingSlash(app.site.options.baseUrl);
  const href = `${base}${ensureLeadingSlash(fileName)}`;
  return `<link rel="${rel}" href="${href}">`;
}

function createPreloadTag(app: App, fileName?: string) {
  if (!fileName) return '';

  const base = removeEndingSlash(app.site.options.baseUrl);
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
      imports.add(file);
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
  const srcPath = fs.realpathSync(app.dirs.root.relative(page.rootPath ?? ''));

  const pageChunk = clientBundle.output.find(
    (chunk) => chunk.type === 'chunk' && chunk.facadeModuleId === srcPath,
  ) as OutputChunk;

  return {
    imports: Array.from(
      new Set([...appChunk.imports, ...(pageChunk?.imports ?? [])]),
    ),
    dynamicImports: Array.from(
      new Set([
        // Needs to be filtered.
        // ...appChunk.dynamicImports,
        ...(pageChunk?.dynamicImports ?? []),
      ]),
    ),
  };
}

function renderHeadTag([tag, attrs, innerHTML = '']: HeadConfig): string {
  const openTag = `<${tag}${renderHeadAttrs(attrs)}>`;
  if (tag === 'link' || tag === 'meta' || tag === 'base') {
    return openTag;
  }
  return `${openTag}${innerHTML}</${tag}>`;
}

function renderHeadAttrs(attrs: HeadAttrsConfig): string {
  return Object.entries(attrs)
    .filter((item): item is [string, string | true] => item[1] !== false)
    .map(([key, value]) =>
      value === true ? ` ${key}` : ` ${key}="${attrs[key]}"`,
    )
    .join('');
}

function addSocialTags(
  site: SiteOptions,
  page: ServerPage,
  head: HeadConfig[],
): HeadConfig[] {
  const pageTitle: string =
    head.find((tag) => tag[0] === 'title')?.[2] ?? site.title;

  const pageDescription: string =
    (head.find(
      (tag) => tag[0] === 'meta' && tag[1]?.name === 'description',
    )?.[1]?.content as string) ?? site.description;

  const tags: HeadConfig[] = [
    ['meta', { property: 'og:site_name', content: site.title }],
    ['meta', { property: 'og:title', content: pageTitle }],
    ['meta', { property: 'og:description', content: pageDescription }],
    ['meta', { property: 'twitter:title', content: pageTitle }],
    ['meta', { property: 'twitter:description', content: pageDescription }],
  ];

  head.push(
    ...tags.filter(
      (tag) =>
        !head.some(
          (headTag) =>
            headTag[0] === 'meta' && headTag[1]?.property === tag[1].property,
        ),
    ),
  );

  return head;
}
