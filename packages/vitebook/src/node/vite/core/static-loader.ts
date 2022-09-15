import kleur from 'kleur';
import type { App } from 'node/app/App';
import type { PageFileRoute } from 'node/app/routes';
import { createStaticLoaderInput } from 'server';
import type {
  ServerModuleLoader,
  ServerRedirect,
  StaticLoaderCacheKeyBuilder,
  StaticLoaderCacheMap,
  StaticLoaderInput,
  StaticLoaderOutput,
  StaticLoaderOutputMap,
} from 'server/types';
import { resolveStaticDataAssetId } from 'shared/data';
import { isFunction, isString } from 'shared/utils/unit';
import { isLinkExternal, slash } from 'shared/utils/url';

export async function callStaticLoaders(
  url: URL,
  app: App,
  route: PageFileRoute,
  loader: ServerModuleLoader,
) {
  const map: StaticLoaderOutputMap = new Map();
  const input = createStaticLoaderInput(url, route);

  let redirect: ServerRedirect | undefined;

  // Load page first - if it has a redirect we'll skip loading layouts.
  await (async () => {
    const id = resolveStaticDataAssetId(route.file.routePath, url.pathname);
    const output = await callStaticLoader(app, route.file.path, input, loader);

    map.set(id, output);

    if (output.redirect) {
      const path = isString(output.redirect)
        ? output.redirect
        : output.redirect.path;

      const status = isString(output.redirect)
        ? 302
        : output.redirect.status ?? 302;

      const normalizedPath = !isLinkExternal(path, app.vite.resolved!.base)
        ? slash(path)
        : path;

      redirect = { path: normalizedPath, status };
    }
  })();

  if (redirect) return { output: map, redirect };

  await Promise.all(
    route.file.layouts.map(async (layout) => {
      const output = await callStaticLoader(app, layout.path, input, loader);
      const id = resolveStaticDataAssetId(layout.routePath, url.pathname);
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
  loader: ServerModuleLoader,
): Promise<StaticLoaderOutput> {
  if (!filePath) return {};

  const file = app.files.layouts.is(filePath)
    ? app.files.layouts.find(filePath)
    : app.files.pages.find(filePath);

  if (!file) {
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

  const { staticLoader } = await loader(file.path);

  if (!staticLoader) {
    clearStaticLoaderCache(filePath);
    return {};
  }

  const output = (await staticLoader(input)) ?? {};

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
