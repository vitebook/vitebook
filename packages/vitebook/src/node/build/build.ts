import kleur from 'kleur';
import type { App } from 'node/app/App';
import { createAppEntries } from 'node/app/create/app-factory';
import type {
  EndpointFileRoute,
  PageFileRoute,
  SystemFileRoute,
} from 'node/app/routes';
import { callStaticLoaders } from 'node/vite/core';
import fs from 'node:fs';
import type { OutputAsset, OutputBundle, OutputChunk } from 'rollup';
import { createStaticLoaderDataMap } from 'server';
import { createEndpointHandler } from 'server/http';
import { installPolyfills } from 'server/polyfills';
import type {
  ServerEntryModule,
  ServerRedirect,
  ServerRenderResult,
  StaticLoaderOutputMap,
} from 'server/types';
import { cleanRoutePath, findRoute } from 'shared/routing';
import { isFunction } from 'shared/utils/unit';
import { type Manifest as ViteManifest } from 'vite';

import { createAutoBuildAdapter, getBuildAdapterUtils } from './adapter';
import { resolveServerLoaderChunks } from './chunks';

export async function build(
  app: App,
  clientBundle: OutputBundle,
  serverBundle: OutputBundle,
): Promise<void> {
  if (app.routes.pages.size === 0) {
    console.log(kleur.bold(`❓ No pages were resolved`));
    return;
  }

  await installPolyfills();

  const ssrProtocol = app.vite.resolved!.server.https ? 'https' : 'http';
  const ssrOrigin = `${ssrProtocol}://localhost`;

  const pageRoutes = app.routes.pages.toArray();
  const entries = createAppEntries(app, { isSSR: true });
  const viteManifestPath = app.dirs.client.resolve('vite-manifest.json');
  const { chunks, assets } = collectOutput(clientBundle);

  const entryChunk = chunks.find(
    (chunk) => chunk.isEntry && /^_immutable\/entry-/.test(chunk.fileName),
  )!;
  const appChunk = chunks.find(
    (chunk) => chunk.isEntry && /^_immutable\/app-/.test(chunk.fileName),
  )!;
  const appCSSAsset = assets.find((asset) => asset.fileName.endsWith('.css'))!;

  const bundles: BuildBundles = {
    entries,
    client: {
      output: clientBundle,
      entryChunk,
      appChunk,
      appCSSAsset,
      chunks,
      assets,
      viteManifest: JSON.parse(
        await fs.promises.readFile(viteManifestPath, 'utf-8'),
      ),
    },
    server: {
      output: serverBundle,
      chunks: collectChunks(serverBundle),
    },
  };

  console.log();

  const build: BuildData = {
    entries,
    links: new Map(),
    badLinks: new Map(),
    staticPages: new Set(),
    staticData: new Map(),
    staticRedirects: new Map(),
    staticLoaderOutput: new Map(),
    staticRenders: new Map(),
    serverRoutes: resolveServerLoaderChunks(app, bundles.server),
    serverPages: new Set(),
    serverEndpoints: new Set(app.routes.endpoints),
    serverRouteChunks: new Map(),
  };

  // staticPages + serverPages
  for (const route of app.routes.pages) {
    if (
      build.serverRoutes.has(route) ||
      route.file.layouts.some((layout) =>
        build.serverRoutes.has(app.routes.layouts.getByFile(layout)),
      )
    ) {
      build.serverPages.add(route);
    } else {
      build.staticPages.add(route);
    }
  }

  // serverRouteChunks
  for (const route of app.routes.client) {
    const chunk = bundles.server.chunks.find(
      (chunk) => chunk.facadeModuleId === route.file.path,
    );
    build.serverRouteChunks.set(route.file.path, chunk!);
  }

  const $ = getBuildAdapterUtils(app, bundles, build);

  const adapterFactory = isFunction(app.config.build.adapter)
    ? app.config.build.adapter
    : createAutoBuildAdapter(app.config.build.adapter);

  const adapter = await adapterFactory(app, bundles, build, $);

  // -------------------------------------------------------------------------------------------
  // LOAD DATA
  // -------------------------------------------------------------------------------------------

  const resolveServerChunkPath = (filePath: string) => {
    return app.dirs.server.resolve(
      build.serverRouteChunks.get(filePath)!.fileName,
    );
  };

  const fetch = globalThis.fetch;
  globalThis.fetch = (input, init) => {
    if (typeof input === 'string' && app.routes.endpoints.test(input)) {
      const url = new URL(`${ssrOrigin}${input}`);
      const route = findRoute(url, app.routes.endpoints.toArray());

      if (!route) {
        return Promise.resolve(new Response('Not found', { status: 404 }));
      }

      const handler = createEndpointHandler({
        pattern: route.pattern,
        getClientAddress: () => {
          throw new Error('Can not resolve `clientAddress` during SSR');
        },
        loader: () => import(resolveServerChunkPath(route.file.path)),
      });

      return handler(new Request(url, init));
    }

    return fetch(input, init);
  };

  // eslint-disable-next-line no-inner-declarations
  async function loadStaticOutput(url: URL, route: PageFileRoute) {
    const pathname = $.normalizeURL(url).pathname;

    if (build.staticLoaderOutput.has(pathname)) {
      return build.staticLoaderOutput.get(pathname)!;
    }

    await adapter.startLoadingStaticData?.(pathname, route);

    const result = await callStaticLoaders(
      url,
      app,
      route,
      (filePath) => import(resolveServerChunkPath(filePath!)),
    );

    build.staticLoaderOutput.set(pathname, result);

    if (result.redirect) {
      const pathname = $.normalizeURL(url).pathname;
      build.staticRedirects.set(pathname, {
        from: pathname,
        to: result.redirect.path,
        filename: $.resolveHTMLFilename(url),
        html: $.createRedirectMetaTag(result.redirect.path),
        status: result.redirect.status,
      });
      await adapter?.finishLoadingStaticData?.(
        pathname,
        route,
        result.output,
        result.redirect.path,
      );
      return result;
    }

    for (const id of result.output.keys()) {
      const content = result.output.get(id)!.data ?? {};
      if (Object.keys(content).length > 0) {
        const serializedContent = JSON.stringify(content);
        const contentHash = $.hash(serializedContent);
        build.staticData.set(id, {
          data: content,
          idHash: $.hash(id),
          contentHash,
          filename: $.resolveDataFilename(contentHash),
          serializedData: JSON.stringify(content),
        });
      }
    }

    await adapter?.finishLoadingStaticData?.(
      pathname,
      route,
      result.output,
      result.redirect,
    );

    return result;
  }

  // -------------------------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------------------------

  const serverEntryPath = app.dirs.server.resolve('entry.js');
  const validPathname = /(\/|\.html)$/;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { render } = (await import(serverEntryPath)) as ServerEntryModule;

  // eslint-disable-next-line no-inner-declarations
  async function buildPage(url: URL, route: PageFileRoute) {
    const pathname = $.normalizeURL(url).pathname;

    if (build.links.has(pathname) || build.badLinks.has(pathname)) {
      return;
    }

    if (!validPathname.test(pathname)) {
      build.badLinks.set(pathname, {
        route,
        reason: 'malformed URL pathname',
      });
      return;
    }

    const loadResult = await loadStaticOutput(url, route);

    // Redirect.
    if (loadResult.redirect) {
      const location = loadResult.redirect.path;
      await buildPageFromHref(route, location);
      await adapter.finishRenderingPage?.(pathname, route, {
        redirect: loadResult.redirect,
      });
      return;
    }

    // Pages that are dynamically rendered on the server (i.e., has `serverLoader` in branch).
    if (!build.staticPages.has(route)) {
      return;
    }

    build.links.set(pathname, route);
    await adapter.startRenderingPage?.(pathname, route);

    const staticData = createStaticLoaderDataMap(loadResult.output);

    // loaded route
    const ssr = await render(url, {});

    const result = {
      filename: $.resolveHTMLFilename(url),
      route,
      ssr,
      dataAssetIds: new Set(staticData.keys()),
    };

    build.staticRenders.set(pathname, result);
    await adapter.finishRenderingPage?.(pathname, route, result);

    const hrefs = $.crawl(ssr.html);
    for (let i = 0; i < hrefs.length; i++) {
      await buildPageFromHref(route, hrefs[i]);
    }
  }

  // eslint-disable-next-line no-inner-declarations
  async function buildPageFromHref(route: PageFileRoute, href: string) {
    if (href.startsWith('#') || $.isLinkExternal(href)) return;

    const url = new URL(`${ssrOrigin}${$.slash(href)}`);
    const pathname = $.normalizeURL(url).pathname;

    if (build.links.has(pathname) || build.badLinks.has(pathname)) return;

    const page = findRoute(url, pageRoutes);

    if (page) {
      await buildPage(url, page);
      return;
    }

    build.badLinks.set(pathname, {
      route,
      reason: 'no matching route (404)',
    });
  }

  // Start with static page paths and then crawl additional links.
  for (const route of pageRoutes.filter((route) => !route.dynamic).reverse()) {
    await buildPage(
      new URL(`${ssrOrigin}${cleanRoutePath(route.pattern.pathname)}`),
      route,
    );
  }

  await adapter.startRenderingPages?.();

  for (const entry of app.config.routes.entries) {
    const url = new URL(`${ssrOrigin}${$.slash(entry)}`);
    const page = findRoute(url, pageRoutes);

    if (page) {
      await buildPage(url, page);
    } else {
      build.badLinks.set(entry, {
        reason: 'no matching route (404)',
      });
    }
  }

  await adapter.finishRenderingPages?.();
  await adapter.write?.();
  await adapter.close?.();
}

function collectChunks(bundle: OutputBundle) {
  const chunks: OutputChunk[] = [];

  for (const value of Object.values(bundle)) {
    if (value.type === 'chunk') {
      chunks.push(value);
    }
  }

  return chunks;
}

function collectOutput(bundle: OutputBundle) {
  const chunks: OutputChunk[] = [];
  const assets: OutputAsset[] = [];

  for (const value of Object.values(bundle)) {
    if (value.type === 'asset') {
      assets.push(value);
    } else {
      chunks.push(value);
    }
  }

  return { chunks, assets };
}

export type BuildBundles = {
  entries: Record<string, string>;
  client: {
    output: OutputBundle;
    entryChunk: OutputChunk;
    appChunk: OutputChunk;
    appCSSAsset?: OutputAsset;
    chunks: OutputChunk[];
    assets: OutputAsset[];
    /**
     * Vite manifest that can be used to build preload/prefetch directives. The manifest contains
     * mappings of module IDs to their associated chunks and asset files.
     *
     * @see {@link https://vitejs.dev/guide/ssr.html#generating-preload-directives}
     */
    viteManifest: ViteManifest;
  };
  server: {
    output: OutputBundle;
    chunks: OutputChunk[];
  };
};

export type BuildData = {
  /**
   * Application entry files that are passed to Rollup's `input` option.
   */
  entries: Record<string, string>;
  /**
   * Valid links and their respective routes that were found during the static build process.
   */
  links: Map<string, PageFileRoute>;
  /**
   * Map of invalid links that were either malformed or matched no route pattern during
   * the static build process. The key contains the bad URL pathname.
   */
  badLinks: Map<string, { route?: PageFileRoute; reason: string }>;
  /**
   * Page routes that are static meaning they contain no `serverLoader` in their branch (page
   * itself or any of its layouts).
   */
  staticPages: Set<PageFileRoute>;
  /**
   * Redirects returned from `staticLoader` calls. The object keys are the URL pathname being
   * redirected from.
   */
  staticRedirects: Map<
    string,
    {
      /** The URL pathname being redirected from. */
      from: string;
      /** The URL pathname being redirected to. */
      to: string;
      /** The redirect HTML file name which can be used to output file relative to build directory. */
      filename: string;
      /** The HTML file content containing the redirect meta tag. */
      html: string;
      /** HTTP status code used for the redirect. */
      status: number;
    }
  >;
  /**
   * Map of links (URL Pathname) and their respective loaded server output from calling the
   * page/layout `staticLoader()`.
   */
  staticLoaderOutput: Map<
    string,
    {
      /** Map of data asset id to server loaded output object. */
      output: StaticLoaderOutputMap;
      /** Any redirect returned from the loaded output. */
      redirect?: ServerRedirect;
    }
  >;
  /**
   * Map of links (URL pathname) and their respective SSR rendered content and loaded data asset
   * IDs.
   */
  staticRenders: Map<
    string,
    {
      /** The HTML file name which can be used to output file relative to build directory. */
      filename: string;
      /** The matching route for this path. */
      route: PageFileRoute;
      /** The SSR results containing head, css, and HTML renders. */
      ssr: ServerRenderResult;
      /**
       * All static data asset ID's that belong to this path. These can be used find matching
       * records in the `staticData` object.
       */
      dataAssetIds: Set<string>;
    }
  >;
  /**
   * Static JSON data that has been loaded by pages and layouts. The key is a unique data asset ID
   * for the given page/layouts combination. You can find data ID's in the `renders` map for each
   * page.
   */
  staticData: Map<
    string,
    {
      /** The data JSON file name which can be used to output file relative to build directory. */
      filename: string;
      /** Loaded data. */
      data: Record<string, unknown>;
      /** The loaded data serailized (JSON.stringify). */
      serializedData: string;
      /** The data asset ID sha-1 hash. */
      idHash: string;
      /** The serialized content sha-1 hash. */
      contentHash: string;
    }
  >;
  /**
   * File routes that contain a `serverLoader` export. These routes should be dynamically rendered
   * on the server.
   */
  serverRoutes: Set<SystemFileRoute>;
  /**
   * Page routes that are dynamic meaning they contain a `serverLoader` in their branch (page
   * itself or any of its layouts). These pages are dynamically rendered on the server.
   */
  serverPages: Set<PageFileRoute>;
  /**
   * Server endpoints that are used server-side to respond to HTTP requests.
   */
  serverEndpoints: Set<EndpointFileRoute>;
  /**
   * Route ids and their respective server chunks.
   */
  serverRouteChunks: Map<string, OutputChunk>;
};
