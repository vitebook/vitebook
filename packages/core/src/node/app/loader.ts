import kleur from 'kleur';

import {
  buildDataAssetUrl,
  DATA_ASSET_URL_BASE,
  type ServerContext,
  type ServerLoadedData,
  type ServerLoader,
  type ServerPage,
} from '../../shared';
import { logger } from '../utils';
import { type App } from './App';

export function buildDataLoaderScriptTag(map: ServerContext['data']) {
  const output = {};

  for (const assetUrl of map.keys()) {
    const data = map.get(assetUrl)!;
    if (Object.keys(data).length > 0) {
      output[assetUrl.replace(DATA_ASSET_URL_BASE, '')] = data;
    }
  }

  return `<script id="__VBK_DATA__" type="application/json">${JSON.stringify(
    output,
  )}</script>`;
}

export async function loadPageDataMap(
  app: App,
  page: ServerPage,
  moduleLoader: (filePath: string) => unknown | Promise<unknown>,
) {
  const map: ServerContext['data'] = new Map();

  await Promise.all([
    ...page.layouts
      .map((layout) => app.pages.getLayoutByIndex(layout)!)
      .map(async (layout) => {
        const data = await loadModuleData(
          app,
          layout.rootPath,
          page.route,
          moduleLoader,
        );

        map.set(buildDataAssetUrl(layout.rootPath, page.route), data);
      }),
    (async () => {
      const data = await loadModuleData(
        app,
        page.rootPath,
        page.route,
        moduleLoader,
      );
      map.set(buildDataAssetUrl(page.rootPath, page.route), data);
    })(),
  ]);

  return map;
}

export async function loadModuleData(
  app: App,
  fileRootPath: string | null,
  route: string | null,
  moduleLoader: (filePath: string) => unknown | Promise<unknown>,
): Promise<ServerLoadedData> {
  if (!fileRootPath || !route) return {};

  const module = app.pages.isLayout(fileRootPath)
    ? app.pages.getLayout(fileRootPath)
    : app.pages.getPage(fileRootPath);

  if (!module || !module.hasLoader) return {};

  const { loader } = (await moduleLoader(module.filePath)) as {
    loader?: ServerLoader;
  };

  try {
    const data = await loader?.({ route });

    if (typeof data !== 'object') {
      logger.warn(
        logger.formatWarnMsg(
          [
            'Received invalid data object.\n',
            `${kleur.bold('File Path:')} ${fileRootPath}`,
            `${kleur.bold('Route:')} ${route}`,
            `${kleur.bold('Data:')} ${data}`,
            `${kleur.bold('Data Type:')} ${typeof data}`,
          ].join('\n'),
        ),
      );

      return {};
    }

    return data!;
  } catch (e) {
    // TODO: handle this with error boundaries.
    logger.error(
      logger.formatErrorMsg(
        [
          'Error was thrown by data loader.\n',
          `${kleur.bold('File Path:')} ${fileRootPath}`,
          `${kleur.bold('URL Path:')} ${route}`,
        ].join('\n'),
      ),
      `\n${e}`,
    );
  }

  return {};
}
