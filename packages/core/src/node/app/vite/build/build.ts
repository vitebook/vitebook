import kleur from 'kleur';
import ora from 'ora';
import type { OutputAsset, OutputChunk } from 'rollup';

import type { ServerEntryModule } from '../../../../shared';
import { fs, path } from '../../../utils';
import { logger, LoggerIcon } from '../../../utils/logger';
import type { App } from '../../App';
import { resolvePages } from '../../create/resolvePages';
import { bundle } from './bundle';

export async function build(app: App): Promise<void> {
  const startTime = Date.now();
  const spinner = ora();

  logger.info(kleur.bold('~~~ Vitebook ~~~\n'));

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
      `Rendering ${app.pages.length + (includesHomePage() ? 0 : 1)} pages...`
    )
  );

  try {
    const [clientBundle] = await bundle(app);

    const APP_CHUNK = clientBundle.output.find(
      (chunk) => chunk.type === 'chunk' && chunk.isEntry
    ) as OutputChunk;

    const CSS_CHUNK = clientBundle.output.find(
      (chunk) => chunk.type === 'asset' && chunk.fileName.endsWith('.css')
    ) as OutputAsset;

    const HTML_TEMPLATE = (
      await fs.readFile(app.dirs.config.resolve('index.html'), 'utf-8')
    ).replace('{{ version }}', app.version);

    const SSR_MANIFEST = JSON.parse(
      await fs.readFile(app.dirs.out.resolve('ssr-manifest.json'), 'utf-8')
    );

    const serverEntryPath = app.dirs.out.resolve('server', 'entry-server.cjs');

    await fs.rename(
      app.dirs.out.resolve(
        'server',
        path.changeExt(path.basename(app.client.entry.server), 'js')
      ),
      serverEntryPath
    );

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { render } = require(app.dirs.out.resolve(
      'server',
      serverEntryPath
    )) as ServerEntryModule;

    // Include home page so it's rendered (if not included).
    if (!includesHomePage()) {
      // @ts-expect-error - only the route is required
      app.pages.unshift({ route: '/' });
    }

    for (const page of app.pages) {
      const { context, html } = await render(page);

      // TODO: determine page + preload links

      const pageHtml = HTML_TEMPLATE.replace('{{ lang }}', context.lang)
        .replace(`<!--@vitebook/head-->`, '')
        .replace(`<!--@vitebook/app-->`, html)
        .replace('<!--@vitebook/body-->', '');

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
      symbol: LoggerIcon.Error
    });
    throw e;
  } finally {
    // ...
  }

  spinner.stopAndPersist({
    symbol: LoggerIcon.Success,
    text: kleur.bold(`Rendered ${kleur.underline(app.pages.length)} pages`)
  });

  logRoutes(app);

  const endTime = ((Date.now() - startTime) / 1000).toFixed(2);

  const speedIcon = {
    2: '🤯',
    4: '🏎️',
    6: '🏃',
    10: '🐌',
    Infinity: '⚰️'
  };

  logger.success(
    kleur.bold(
      `${LoggerIcon.Success} Build complete in ${kleur.bold(
        kleur.underline(`${endTime}s`)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      )} ${speedIcon[Object.keys(speedIcon).find((t) => endTime <= t)!]}`
    )
  );

  const pkgManager = guessPackageManager(app);
  const serveCommand = await findServeScriptName(app);
  logger.success(
    kleur.bold(
      `\n⚡ ${
        serveCommand
          ? `Run \`${
              pkgManager === 'npm' ? 'npm run' : pkgManager
            } ${serveCommand}\` to`
          : 'Ready for'
      } preview\n`
    )
  );
}

function logRoutes(app: App) {
  const logs: string[] = [''];

  app.pages.forEach((page) => {
    logs.push(
      kleur.dim(
        `- ${page.route === '/' ? 'index.html' : decodeURI(page.route)}`
      )
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

async function findServeScriptName(app: App): Promise<string | undefined> {
  try {
    const packageJson = app.dirs.root.resolve('package.json');
    if (fs.existsSync(packageJson)) {
      const content = (await fs.readFile(packageJson)).toString();
      const json = JSON.parse(content);

      const script = Object.keys(json.scripts ?? {}).find((script) => {
        return json.scripts[script].includes('vitebook serve');
      });

      return script;
    }
  } catch (e) {
    //
  }

  return undefined;
}
