import { type ServerResponse } from 'http';
import { type Connect, type ModuleNode, type ViteDevServer } from 'vite';

import { matchRouteInfo, type ServerEntryModule } from '../../../../shared';
import { virtualModuleId } from '../../alias';
import { type App } from '../../App';
import { readIndexHtmlFile } from './index-html';
import {
  buildServerLoadedDataMap,
  createDataScriptTag,
  loadPageServerOutput,
} from './server-loader';

export async function handlePageRequest(
  url: URL,
  app: App,
  req: Connect.IncomingMessage,
  res: ServerResponse,
) {
  const pathname = decodeURI(url.pathname);

  const index = readIndexHtmlFile(app);

  const transformedIndex = await app.vite.server!.transformIndexHtml(
    pathname,
    index,
    req.originalUrl,
  );

  const { render } = (await app.vite.server!.ssrLoadModule(
    app.entry.server,
  )) as ServerEntryModule;

  const match = matchRouteInfo(url, app.nodes.pages.toArray());
  const page = app.nodes.pages.getByIndex(match?.index ?? -1);

  if (!page) {
    res.statusCode = 404;
    res.end('Not found.');
    return;
  }

  const { output: serverOutput, redirect } = await loadPageServerOutput(
    url,
    app,
    page,
    app.vite.server!.ssrLoadModule,
  );

  if (redirect) {
    res.statusCode = 307;
    res.setHeader('Location', redirect).end();
    return;
  }

  const serverData = buildServerLoadedDataMap(serverOutput);
  const dataScript = createDataScriptTag(serverData);

  const { html: appHtml, head } = await render(url, { data: serverData });

  const appFilePath = app.vite
    .server!.moduleGraph.getModuleById(`/${virtualModuleId.app}`)!
    .importedModules.values()
    .next().value.file;

  const stylesMap = await Promise.all(
    [
      appFilePath,
      ...page.layouts.map(
        (index) => app.nodes.layouts.getByIndex(index).filePath,
      ),
      page.filePath,
    ].map((file) => getStylesByFile(app.vite.server!, file)),
  );

  // Prevent FOUC during development.
  const styles = [
    '<style id="__VBK_SSR_STYLES__" type="text/css">',
    stylesMap.map(Object.values).flat().join('\n'),
    '</style>',
  ].join('\n');

  const html = transformedIndex
    .replace(`<!--@vitebook/head-->`, head + styles)
    .replace(`<!--@vitebook/app-->`, appHtml)
    .replace('<!--@vitebook/body-->', dataScript);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end(html);
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
