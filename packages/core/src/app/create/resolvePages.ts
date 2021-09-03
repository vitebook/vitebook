import kleur from 'kleur';

import { globby } from '../../utils/fs.js';
import { prettyJsonStr } from '../../utils/json.js';
import { logger } from '../../utils/logger.js';
import { ensureLeadingSlash, path } from '../../utils/path.js';
import { isArray } from '../../utils/unit.js';
import type { App } from '../App.js';
import type { ServerPage } from '../site/Page.js';

export function resolvePageFilePaths(app: App): string[] {
  return globby.sync(app.options.pages, {
    absolute: true,
    cwd: app.dirs.src.path
  });
}

const alreadyWarned = new Set();

export async function resolvePages(app: App): Promise<void> {
  app.pages = [];

  const pageFilePaths = resolvePageFilePaths(app);

  for (let i = 0; i < pageFilePaths.length; i += 1) {
    const id = pageFilePaths[i];

    let j = 0;
    let resolved = false;

    while (!resolved && j < app.plugins.length) {
      const plugin = app.plugins[j];

      const page = await plugin.resolvePage?.(id, app.env);

      if (page) {
        const relativeFilePath = path.relative(app.dirs.src.path, id);

        app.pages.push({
          ...page,
          component:
            page.component ??
            ensureLeadingSlash(relativeFilePath).toLowerCase(),
          filePath: id,
          relativeFilePath
        });

        resolved = true;
      }

      j += 1;
    }

    if (!alreadyWarned.has(id) && !resolved) {
      logger.warn(
        logger.formatWarnMsg(
          `No plugin could resolve page for: ${kleur.bold(
            path.basename(app.dirs.src.path) +
              '/' +
              path.relative(app.dirs.src.path, id)
          )}`
        )
      );

      alreadyWarned.add(id);
    }
  }
}

export function inferPagePath(app: App, { filePath }: ServerPage): string {
  const relativePath = path.relative(app.dirs.src.path, filePath);
  return ensureLeadingSlash(relativePath)
    .replace(new RegExp(`(${path.extname(filePath)})$`), '.html')
    .replace(/\/(README|index).html$/i, '/')
    .toLowerCase();
}

const stripImportQuotesRE = /"\(\) => import\((.+)\)"/g;

export function loadPages(app: App): string {
  return `export default ${prettyJsonStr(
    app.pages.map((page) => ({
      ...page,
      path: page.path ?? inferPagePath(app, page),
      component: `() => import('${page.component}')`,
      data: page.data
        ? `() => import('${replacePathAliases(app, page.data)}')`
        : undefined,
      // Not included client-side.
      filePath: undefined,
      relativeFilePath: undefined,
      meta: undefined
    }))
  )}`.replace(stripImportQuotesRE, '() => import($1)');
}

export function replacePathAliases(app: App, filePath: string): string {
  const aliases = app.options.vite.resolve?.alias ?? {};

  let resolvedPath = filePath;

  if (isArray(aliases)) {
    aliases.forEach(({ find, replacement }) => {
      resolvedPath = resolvedPath.replace(find, replacement);
    });
  } else {
    Object.keys(aliases).forEach((find) => {
      resolvedPath = resolvedPath.replace(find, aliases[find]);
    });
  }

  return resolvedPath;
}
