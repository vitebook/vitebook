import kleur from 'kleur';

import {
  execRouteMatch,
  isFunction,
  isLinkExternal,
  resolveDataAssetID,
  type ServerLoadedDataMap,
  type ServerLoadedOutput,
  type ServerLoadedOutputMap,
  type ServerLoader,
  type ServerLoaderCacheKeyBuilder,
  type ServerLoaderCacheMap,
  type ServerLoaderInput,
  type ServerPage,
  slash,
} from '../../../../shared';
import { type App } from '../../App';

export function createDataScriptTag(map: ServerLoadedDataMap) {
  const table = {};

  for (const id of map.keys()) {
    const data = map.get(id)!;
    if (data && Object.keys(data).length > 0) {
      table[id] = data;
    }
  }

  return [
    '<script id="__VBK_DATA__" type="application/json">',
    JSON.stringify(table),
    '</script>',
  ].join('');
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
    params: match.groups,
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

  let redirect: string | undefined;

  // Load page first - if it has a redirect we'll skip loading layouts.
  await (async () => {
    const id = resolveDataAssetID(pathname);

    const output = await runModuleServerLoader(
      app,
      page.filePath,
      input,
      moduleLoader,
    );

    map.set(id, output);

    redirect =
      output.redirect &&
      !isLinkExternal(output.redirect, app.vite.resolved!.base)
        ? slash(output.redirect)
        : output.redirect;
  })();

  if (redirect) return { output: map, redirect };

  await Promise.all(
    page.layouts.map(async (index) => {
      const id = resolveDataAssetID(pathname, index);
      const layout = app.nodes.layouts.getByIndex(index);

      const output = await runModuleServerLoader(
        app,
        layout.filePath,
        input,
        moduleLoader,
      );

      map.set(id, output);
    }),
  );

  return { output: map, redirect };
}

const loadedCache = new Map<string, ServerLoaderCacheMap>();
const cacheKeyBuilder = new Map<string, ServerLoaderCacheKeyBuilder>();

export function clearServerLoaderCache(filePath: string) {
  cacheKeyBuilder.delete(filePath);
  loadedCache.delete(filePath);
}

export async function runModuleServerLoader(
  app: App,
  filePath: string | null,
  input: ServerLoaderInput,
  moduleLoader: (filePath: string) => unknown | Promise<unknown>,
): Promise<ServerLoadedOutput> {
  if (!filePath) return {};

  const module = app.nodes.layouts.is(filePath)
    ? app.nodes.layouts.find(filePath)
    : app.nodes.pages.find(filePath);

  if (!module || !module.hasLoader) {
    clearServerLoaderCache(filePath);
    return {};
  }

  if (cacheKeyBuilder.has(filePath)) {
    const buildCacheKey = cacheKeyBuilder.get(filePath)!;
    const cacheKey = await buildCacheKey(input);
    const cache = loadedCache.get(filePath);
    if (cacheKey && cache && cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }
  }

  const { loader } = (await moduleLoader(module.filePath)) as {
    loader?: ServerLoader;
  };

  const output = (await loader?.(input)) ?? {};

  const data = output.data;
  const buildCacheKey = output.cache;
  const isDataValid = !data || typeof data === 'object';

  if (isDataValid && isFunction(buildCacheKey)) {
    const cacheKey = await buildCacheKey(input);

    if (cacheKey) {
      const cache = loadedCache.get(filePath) ?? new Map();
      cache.set(cacheKey, output);
      loadedCache.set(filePath, cache);
    }

    cacheKeyBuilder.set(filePath, buildCacheKey);
  }

  if (!isDataValid) {
    app.logger.warn(
      'Received invalid data from loader (expected object).',
      [
        `\n${kleur.bold('File Path:')} ${filePath}`,
        `${kleur.bold('Data Type:')} ${typeof output.data}`,
      ].join('\n'),
      '\n',
    );

    output.data = {};
  }

  if (buildCacheKey && !isFunction(buildCacheKey)) {
    app.logger.warn(
      'Received invalid cache builder from loader (expected function).',
      [
        `\n${kleur.bold('File Path:')} ${filePath}`,
        `${kleur.bold('Cache Type:')} ${typeof buildCacheKey}`,
      ].join('\n'),
      '\n',
    );
  }

  return output;
}
