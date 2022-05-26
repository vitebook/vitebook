import kleur from 'kleur';

import {
  buildDataAssetID,
  execRouteMatch,
  type ServerContext,
  type ServerLoadedData,
  type ServerLoader,
  type ServerLoaderInput,
  type ServerPage,
} from '../../../../shared';
import { logger } from '../../../utils';
import { type App } from '../../App';

export function buildDataScriptTag(
  map: ServerContext['data'],
  hashTable?: Record<string, string>,
) {
  const output = {};

  for (const id of map.keys()) {
    const hashedId = hashTable?.[id] ?? id;
    const data = map.get(id)!;

    if (Object.keys(data).length > 0) {
      output[hashedId] = data;
    }
  }

  return `<script id="__VBK_DATA__" type="application/json">${JSON.stringify(
    output,
  )}</script>`;
}

export function buildServerLoaderInput(
  url: URL,
  page: ServerPage,
): ServerLoaderInput {
  const match = execRouteMatch(url, page.route)!;

  return {
    pathname: url.pathname,
    page,
    route: page.route,
    match,
  };
}

export async function loadPageDataMap(
  url: URL,
  app: App,
  page: ServerPage,
  moduleLoader: (filePath: string) => unknown | Promise<unknown>,
) {
  const map: ServerContext['data'] = new Map();

  const pathname = decodeURI(url.pathname);
  const input = buildServerLoaderInput(url, page);

  await Promise.all([
    ...page.layouts.map(async (index) => {
      const layout = app.pages.getLayoutByIndex(index)!;

      const data = await loadModuleData(
        app,
        layout.filePath,
        input,
        moduleLoader,
      );

      map.set(buildDataAssetID(pathname, index), data);
    }),
    (async () => {
      const data = await loadModuleData(
        app,
        page.filePath,
        input,
        moduleLoader,
      );
      map.set(buildDataAssetID(pathname), data);
    })(),
  ]);

  return map;
}

export async function loadModuleData(
  app: App,
  filePath: string | null,
  input: ServerLoaderInput,
  moduleLoader: (filePath: string) => unknown | Promise<unknown>,
): Promise<ServerLoadedData> {
  if (!filePath) return {};

  const module = app.pages.isLayout(filePath)
    ? app.pages.getLayout(filePath)
    : app.pages.getPage(filePath);

  if (!module || !module.hasLoader) return {};

  const { loader } = (await moduleLoader(module.filePath)) as {
    loader?: ServerLoader;
  };

  try {
    const data = await loader?.(input);

    if (typeof data !== 'object') {
      logger.warn(
        logger.formatWarnMsg(
          [
            'Received invalid data object.\n',
            `${kleur.bold('File Path:')} ${filePath}`,
            `${kleur.bold('Input:')} ${input}`,
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
          `${kleur.bold('File Path:')} ${filePath}`,
          `${kleur.bold('Input:')} ${input}`,
        ].join('\n'),
      ),
      `\n${e}`,
    );
  }

  return {};
}
