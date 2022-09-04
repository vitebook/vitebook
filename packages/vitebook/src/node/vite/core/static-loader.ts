import kleur from 'kleur';
import type { App } from 'node/app/App';
import { execRouteMatch } from 'router';
import type {
  ServerPage,
  ServerRedirect,
  StaticLoadedOutput,
  StaticLoader,
  StaticLoaderCacheKeyBuilder,
  StaticLoaderCacheMap,
  StaticLoaderDataMap,
  StaticLoaderInput,
  StaticLoaderOutputMap,
} from 'server/types';
import { resolveStaticDataAssetID } from 'shared/data';
import { isFunction, isString } from 'shared/utils/unit';
import { isLinkExternal, slash } from 'shared/utils/url';

export function createStaticDataScriptTag(map: StaticLoaderDataMap) {
  const table = {};

  for (const id of map.keys()) {
    const data = map.get(id)!;
    if (data && Object.keys(data).length > 0) {
      table[id] = data;
    }
  }

  return [
    '<script>',
    `__VBK_STATIC_DATA__ = JSON.parse(${JSON.stringify(
      JSON.stringify(table),
    )});`,
    '</script>',
  ].join('');
}

export function createStaticLoaderOutputMap(map: StaticLoaderOutputMap) {
  const data: StaticLoaderDataMap = new Map();

  for (const id of map.keys()) {
    data.set(id, map.get(id)!.data ?? {});
  }

  return data;
}

export function createStaticLoaderInput(
  url: URL,
  page: ServerPage,
): StaticLoaderInput {
  const match = execRouteMatch(url, page.route)!;
  return {
    pathname: url.pathname,
    page,
    route: page.route,
    params: match.groups,
    match,
  };
}

export async function callStaticLoaders(
  url: URL,
  app: App,
  page: ServerPage,
  moduleLoader: (filePath: string) => unknown | Promise<unknown>,
) {
  const map: StaticLoaderOutputMap = new Map();

  const pathname = decodeURI(url.pathname);
  const input = createStaticLoaderInput(url, page);

  let redirect: ServerRedirect | undefined;

  // Load page first - if it has a redirect we'll skip loading layouts.
  await (async () => {
    const id = resolveStaticDataAssetID(pathname);

    const output = await callStaticLoader(
      app,
      page.filePath,
      input,
      moduleLoader,
    );

    map.set(id, output);

    if (output.redirect) {
      const path = isString(output.redirect)
        ? output.redirect
        : output.redirect.path;

      const statusCode = isString(output.redirect)
        ? 302
        : output.redirect.statusCode ?? 302;

      const normalizedPath = !isLinkExternal(path, app.vite.resolved!.base)
        ? slash(path)
        : path;

      redirect = {
        path: normalizedPath,
        statusCode,
      };
    }
  })();

  if (redirect) return { output: map, redirect };

  await Promise.all(
    page.layouts.map(async (index) => {
      const id = resolveStaticDataAssetID(pathname, index);
      const layout = app.nodes.layouts.getByIndex(index);

      const output = await callStaticLoader(
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

const staticLoaderCache = new Map<string, StaticLoaderCacheMap>();
const staticLoaderCacheKeyBuilder = new Map<
  string,
  StaticLoaderCacheKeyBuilder
>();

export function clearStaticLoaderCache(filePath: string) {
  staticLoaderCacheKeyBuilder.delete(filePath);
  staticLoaderCache.delete(filePath);
}

export async function callStaticLoader(
  app: App,
  filePath: string | null,
  input: StaticLoaderInput,
  moduleLoader: (filePath: string) => unknown | Promise<unknown>,
): Promise<StaticLoadedOutput> {
  if (!filePath) return {};

  const module = app.nodes.layouts.is(filePath)
    ? app.nodes.layouts.find(filePath)
    : app.nodes.pages.find(filePath);

  if (!module || !module.hasStaticLoader) {
    clearStaticLoaderCache(filePath);
    return {};
  }

  if (staticLoaderCacheKeyBuilder.has(filePath)) {
    const buildCacheKey = staticLoaderCacheKeyBuilder.get(filePath)!;
    const cacheKey = await buildCacheKey(input);
    const cache = staticLoaderCache.get(filePath);
    if (cacheKey && cache && cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }
  }

  const { staticLoader } = (await moduleLoader(module.filePath)) as {
    staticLoader?: StaticLoader;
  };

  const output = (await staticLoader?.(input)) ?? {};

  const data = output.data;
  const buildCacheKey = output.cache;
  const isDataValid = !data || typeof data === 'object';

  if (isDataValid && isFunction(buildCacheKey)) {
    const cacheKey = await buildCacheKey(input);

    if (cacheKey) {
      const cache = staticLoaderCache.get(filePath) ?? new Map();
      cache.set(cacheKey, output);
      staticLoaderCache.set(filePath, cache);
    }

    staticLoaderCacheKeyBuilder.set(filePath, buildCacheKey);
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
