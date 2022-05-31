import kleur from 'kleur';

import {
  buildDataAssetID,
  execRouteMatch,
  type ServerLoadedDataMap,
  type ServerLoadedOutput,
  type ServerLoadedOutputMap,
  type ServerLoader,
  type ServerLoaderInput,
  type ServerPage,
} from '../../../../shared';
import { logger } from '../../../utils';
import { type App } from '../../App';

export function buildDataScriptTag(
  map: ServerLoadedDataMap,
  hashTable?: Record<string, string>,
) {
  const output = {};

  for (const id of map.keys()) {
    const hashedId = hashTable?.[id] ?? id;
    const data = map.get(id)!;

    if (data && Object.keys(data).length > 0) {
      output[hashedId] = data;
    }
  }

  return `<script id="__VBK_DATA__" type="application/json">${JSON.stringify(
    output,
  )}</script>`;
}

export function buildServerLoadedDataMap(map: ServerLoadedOutputMap) {
  const data: ServerLoadedDataMap = new Map();

  for (const id of map.keys()) {
    data.set(id, map.get(id)!.data ?? {});
  }

  return data;
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

export async function loadPageServerOutput(
  url: URL,
  app: App,
  page: ServerPage,
  moduleLoader: (filePath: string) => unknown | Promise<unknown>,
) {
  const map: ServerLoadedOutputMap = new Map();

  const pathname = decodeURI(url.pathname);
  const input = buildServerLoaderInput(url, page);

  await Promise.all([
    ...page.layouts.map(async (index) => {
      const layout = app.pages.getLayoutByIndex(index)!;

      const output = await runModuleServerLoader(
        app,
        layout.filePath,
        input,
        moduleLoader,
      );

      map.set(buildDataAssetID(pathname, index), output);
    }),
    (async () => {
      const output = await runModuleServerLoader(
        app,
        page.filePath,
        input,
        moduleLoader,
      );

      map.set(buildDataAssetID(pathname), output);
    })(),
  ]);

  return map;
}

export async function runModuleServerLoader(
  app: App,
  filePath: string | null,
  input: ServerLoaderInput,
  moduleLoader: (filePath: string) => unknown | Promise<unknown>,
): Promise<ServerLoadedOutput> {
  if (!filePath) return {};

  const module = app.pages.isLayout(filePath)
    ? app.pages.getLayout(filePath)
    : app.pages.getPage(filePath);

  if (!module || !module.hasLoader) return {};

  const { loader } = (await moduleLoader(module.filePath)) as {
    loader?: ServerLoader;
  };

  try {
    const output = (await loader?.(input)) ?? {};

    if (output.data && typeof output.data !== 'object') {
      logger.warn(
        logger.formatWarnMsg(
          [
            'Received invalid data from loader.\n',
            `${kleur.bold('File Path:')} ${filePath}`,
            `${kleur.bold('Data Type:')} ${typeof output.data}`,
          ].join('\n'),
        ),
      );

      return {};
    }

    return output;
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
