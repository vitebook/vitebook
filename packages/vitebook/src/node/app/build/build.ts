import kleur from 'kleur';
import fs from 'node:fs';
import type { OutputAsset, OutputBundle, OutputChunk } from 'rollup';
import path from 'upath';
import { type Manifest as ViteManifest } from 'vite';

import {
  cleanRoutePath,
  isFunction,
  isUndefined,
  matchRouteInfo,
  ServerEndpoint,
  type ServerEntryModule,
  type ServerLoadedOutputMap,
  type ServerLoadedRedirect,
  type ServerPage,
  type ServerRenderResult,
} from '../../../shared';
import type { App } from '../App';
import { createAppEntries } from '../create/app-factory';
import { handleRequest } from '../http';
import {
  buildServerLoadedDataMap,
  loadPageServerOutput,
} from '../plugins/core';
import { installPolyfills } from '../polyfills';
import { createAutoBuildAdapter, getBuildAdapterUtils } from './adapter';

export async function build(
  app: App,
  clientBundle: OutputBundle,
  serverBundle: OutputBundle,
): Promise<void> {
  if (app.nodes.pages.size === 0) {
    console.log(kleur.bold(`❓ No pages were resolved`));
    return;
  }

  await installPolyfills();

  const ssrProtocol = app.vite.resolved!.server.https ? 'https' : 'http';
  const ssrOrigin = `${ssrProtocol}://ssr`;

  const pages = app.nodes.pages.toArray();
  const entries = createAppEntries(app, { isSSR: true });
  const entryFilenames = Object.keys(entries);
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

  const build: BuildData = {
    entries,
    links: new Map(),
    badLinks: new Map(),
    data: new Map(),
    redirects: new Map(),
    endpoints: new Map(),
    loaded: new Map(),
    renders: new Map(),
  };

  const $ = getBuildAdapterUtils(app, bundles, build);

  const adapterFactory = isFunction(app.config.build.adapter)
    ? app.config.build.adapter
    : createAutoBuildAdapter(app.config.build.adapter);

  const adapter = await adapterFactory(app, bundles, build, $);

  for (const endpoint of app.nodes.endpoints) {
    build.endpoints.set(
      `/${path.dirname(app.dirs.app.relative(endpoint.rootPath))}/`,
      endpoint,
    );
  }

  // -------------------------------------------------------------------------------------------
  // LOAD DATA
  // -------------------------------------------------------------------------------------------

  const specialCharsRE = /\$|#|\[|\]|{|}|:/g;
  const resolveServerChunkPath = (filePath: string) =>
    app.dirs.server.resolve(
      `${entryFilenames
        .find((name) => entries[name] === filePath)
        ?.replace(specialCharsRE, '_')}.js`,
    );

  globalThis.fetch = (input, init) => {
    if (typeof input === 'string' && input.startsWith('/api')) {
      const url = new URL(`${ssrOrigin}${input}`);
      const match = matchRouteInfo(url, app.nodes.endpoints.toArray());

      if (!match) {
        return Promise.resolve(new Response('Not found', { status: 404 }));
      }

      const endpoint = app.nodes.endpoints.getByIndex(match.index);

      return handleRequest(
        new Request(url, init),
        match.route.pattern,
        () => {
          throw new Error('Can not resolve `clientAddres` during SSR');
        },
        () => import(resolveServerChunkPath(endpoint.filePath)),
      );
    }

    return fetch(input, init);
  };

  // eslint-disable-next-line no-inner-declarations
  async function loadServerOutput(url: URL, page: ServerPage) {
    const pathname = $.normalizeURL(url).pathname;

    if (build.loaded.has(pathname)) {
      return build.loaded.get(pathname)!;
    }

    await adapter.startLoadingPage?.(pathname, page);

    const result = await loadPageServerOutput(
      url,
      app,
      page,
      (filePath) => import(resolveServerChunkPath(filePath)),
    );

    build.loaded.set(pathname, result);

    if (result.redirect) {
      const pathname = $.normalizeURL(url).pathname;
      build.redirects.set(pathname, {
        from: pathname,
        to: result.redirect.path,
        filename: $.resolveHTMLFilename(url),
        html: $.createRedirectMetaTag(result.redirect.path),
        statusCode: result.redirect.statusCode,
      });
      await adapter?.finishLoadingPage?.(
        pathname,
        page,
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
        build.data.set(id, {
          data: content,
          idHash: $.hash(id),
          contentHash,
          filename: $.resolveDataFilename(contentHash),
          serializedData: JSON.stringify(content),
        });
      }
    }

    await adapter?.finishLoadingPage?.(
      pathname,
      page,
      result.output,
      result.redirect,
    );
    return result;
  }

  // -------------------------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------------------------

  const serverEntryPath = app.dirs.server.resolve('entry.js');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { render } = (await import(serverEntryPath)) as ServerEntryModule;

  const validPathname = /(\/|\.html)$/;

  // eslint-disable-next-line no-inner-declarations
  async function buildPage(url: URL, page: ServerPage) {
    const pathname = $.normalizeURL(url).pathname;

    if (build.links.has(pathname) || build.badLinks.has(pathname)) {
      return;
    }

    if (!validPathname.test(pathname)) {
      build.badLinks.set(pathname, {
        page,
        reason: 'malformed URL pathname',
      });
      return;
    }

    build.links.set(pathname, page);
    await adapter.startRenderingPage?.(pathname, page);

    const loadedOutput = await loadServerOutput(url, page);

    // Redirect.
    if (loadedOutput.redirect) {
      const location = loadedOutput.redirect.path;
      await buildPageFromHref(page, location);
      await adapter.finishRenderingPage?.(pathname, page, {
        redirect: loadedOutput.redirect,
      });
      return;
    }

    const serverData = buildServerLoadedDataMap(loadedOutput.output);
    const ssr = await render(url, { data: serverData });

    const result = {
      filename: $.resolveHTMLFilename(url),
      page,
      ssr,
      dataAssetIds: new Set(serverData.keys()),
    };

    build.renders.set(pathname, result);
    await adapter.finishRenderingPage?.(pathname, page, result);

    const hrefs = $.crawl(ssr.html);
    for (let i = 0; i < hrefs.length; i++) {
      await buildPageFromHref(page, hrefs[i]);
    }
  }

  const notFoundRE = /\/@404\./;
  // eslint-disable-next-line no-inner-declarations
  async function buildPageFromHref(page: ServerPage, href: string) {
    if (href.startsWith('#') || $.isLinkExternal(href)) return;

    const url = new URL(`${ssrOrigin}${$.slash(href)}`);
    const pathname = $.normalizeURL(url).pathname;

    if (build.links.has(pathname) || build.badLinks.has(pathname)) return;

    const { index } = matchRouteInfo(url, pages) ?? {};
    const foundPage = !isUndefined(index) && index >= 0 ? pages[index] : null;

    if (foundPage && !notFoundRE.test(foundPage.id)) {
      await buildPage(url, foundPage);
      return;
    }

    build.badLinks.set(pathname, {
      page,
      reason: 'no matching route (404)',
    });
  }

  // Start with static paths and then crawl additional links.
  for (const page of pages.filter((page) => !page.route.dynamic).reverse()) {
    await buildPage(
      new URL(`${ssrOrigin}${cleanRoutePath(page.route.pathname)}`),
      page,
    );
  }

  await adapter.startRenderingPages?.();

  for (const entry of app.config.routes.entries) {
    const url = new URL(`${ssrOrigin}${$.slash(entry)}`);
    const { index } = matchRouteInfo(url, pages) ?? {};

    if (index) {
      const page = pages[index];
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
   * Valid links and their respective server page that were found during the build process.
   */
  links: Map<string, ServerPage>;
  /**
   * Map of invalid links that were either malformed or matched no route pattern during the build
   * process. The key contains the bad URL pathname.
   */
  badLinks: Map<string, { page?: ServerPage; reason: string }>;
  /**
   * Redirects object where the keys are the URL pathname being redirected from.
   */
  redirects: Map<
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
      statusCode: number;
    }
  >;
  /**
   * Links and their respective server endpoint.
   */
  endpoints: Map<string, ServerEndpoint>;
  /**
   * Map of links (URL Pathname) and their respective loaded server output from calling the
   * page/layout `loader()`.
   */
  loaded: Map<
    string,
    {
      /** Map of data asset id to server loaded output object. */
      output: ServerLoadedOutputMap;
      /** Any redirect returned from the loaded output. */
      redirect?: ServerLoadedRedirect;
    }
  >;
  /**
   * Map of links (URL pathname) and their respective SSR rendered content and loaded data asset
   * IDs.
   */
  renders: Map<
    string,
    {
      /** The HTML file name which can be used to output file relative to build directory. */
      filename: string;
      /** The matching server page for this path. */
      page: ServerPage;
      /** The SSR results containing head, css, and HTML renders. */
      ssr: ServerRenderResult;
      /**
       * All data asset ID's that belong to this path. These can be used find matching records in
       * the `data` object.
       */
      dataAssetIds: Set<string>;
    }
  >;
  /**
   * JSON data that has been loaded by pages and layouts. The key is a unique data asset ID for the
   * given page/layouts combination. You can find data ID's in the `renders` map for each page.
   */
  data: Map<
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
};
