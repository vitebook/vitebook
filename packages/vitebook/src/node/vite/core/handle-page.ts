import type { ServerResponse } from 'http';
import type { App } from 'node/app/App';
import type { LeafModuleFile } from 'node/app/files';
import { handleHTTPRequest } from 'node/http';
import { createPageHandler } from 'server/http';
import type { ServerEntryModule, ServerModuleLoader } from 'server/types';
import { matchRoute } from 'shared/routing';
import { coalesceToError } from 'shared/utils/error';
import type { Connect, ModuleNode, ViteDevServer } from 'vite';

import { virtualModuleId } from '../alias';
import { handleDevServerError } from './dev-server';
import { readIndexHtmlFile } from './index-html';

export async function handlePageRequest(
  base: string,
  url: URL,
  app: App,
  req: Connect.IncomingMessage,
  res: ServerResponse,
) {
  url.pathname = url.pathname.replace('/index.html', '/');

  const pathname = decodeURI(url.pathname);
  const index = readIndexHtmlFile(app);
  const route = matchRoute(url, app.routes.pages.toArray());

  // TODO: let request handle this.
  if (!route) {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  try {
    // // We're loading static data first to check for redirects because it supersedes server-side work.
    // // Filesystem > Server-Side
    // const { output: staticData, redirect } = await callStaticLoaders(
    //   url,
    //   app,
    //   route,
    //   app.vite.server!.ssrLoadModule as ServerNodeLoader,
    // );

    // if (redirect) {
    //   res.statusCode = redirect.status;
    //   res.setHeader('Location', redirect.pathname).end();
    //   return;
    // }

    const template = await app.vite.server!.transformIndexHtml(
      pathname,
      index,
      req.originalUrl,
    );

    // const entryLoader = async () =>
    //   (await app.vite.server!.ssrLoadModule(
    //     app.config.entry.server,
    //   )) as ServerEntryModule;

    // pattern: page.route.pattern,
    // template,
    // loader,
    // getClientAddress: () => req.socket.remoteAddress,
    // head: () => loadStyleTag(app, page),
    // staticData: () => staticDataMap,

    // const handler = createPageHandler();

    // await handleHTTPRequest(base, req, res, handler, (error) => {
    //   logDevError(app, req, coalesceToError(error));
    // });

    res.end(template);
  } catch (error) {
    handleDevServerError(app, req, res, error);
  }
}

async function loadStyleTag(app: App, leafFile: LeafModuleFile) {
  const appFilePath = app.vite
    .server!.moduleGraph.getModuleById(`/${virtualModuleId.app}`)!
    .importedModules.values()
    .next().value.file;

  const stylesMap = await Promise.all(
    [
      appFilePath,
      ...leafFile.layouts.map((layout) => layout.path),
      leafFile.path,
    ].map((file) => getStylesByFile(app.vite.server!, file)),
  );

  // Prevent FOUC during development.
  return [
    '<style id="__VBK_SSR_STYLES__" type="text/css">',
    stylesMap.map(Object.values).flat().join('\n'),
    '</style>',
  ].join('\n');
}

// Vite doesn't expose this so we just copy the list for now
const styleRE = /\.(css|less|sass|scss|styl|stylus|pcss|postcss)$/;
export async function getStylesByFile(server: ViteDevServer, file: string) {
  const files = await server.moduleGraph.getModulesByFile(file);
  const node = Array.from(files ?? [])[0];

  if (!node) throw new Error(`Could not find node for ${file}`);

  const deps = new Set<ModuleNode>();
  await findModuleDeps(server, node, deps);

  const styles: Record<string, string> = {};

  for (const dep of deps) {
    const parsed = new URL(dep.url, 'http://localhost/');
    const query = parsed.searchParams;

    if (
      styleRE.test(dep.file!) ||
      (query.has('svelte') && query.get('type') === 'style')
    ) {
      try {
        const mod = await server.ssrLoadModule(dep.url);
        styles[dep.url] = mod.default;
      } catch {
        // no-op
      }
    }
  }

  return styles;
}

export async function findModuleDeps(
  server: ViteDevServer,
  node: ModuleNode,
  deps: Set<ModuleNode>,
) {
  const edges: Promise<void>[] = [];

  async function add(node: ModuleNode) {
    if (!deps.has(node)) {
      deps.add(node);
      await findModuleDeps(server, node, deps);
    }
  }

  async function addByUrl(url: string) {
    const node = await server.moduleGraph.getModuleByUrl(url);
    if (node) await add(node);
  }

  if (node.ssrTransformResult) {
    if (node.ssrTransformResult.deps) {
      node.ssrTransformResult.deps.forEach((url) => edges.push(addByUrl(url)));
    }
  } else {
    node.importedModules.forEach((node) => edges.push(add(node)));
  }

  await Promise.all(edges);
}
