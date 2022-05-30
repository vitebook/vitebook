import { type ServerResponse } from 'http';
import { type Connect, type ModuleNode, type ViteDevServer } from 'vite';

import {
  matchRouteInfo,
  type ServerContext,
  type ServerEntryModule,
} from '../../../../shared';
import { virtualModuleId } from '../../alias';
import { type App } from '../../App';
import { buildDataScriptTag, loadPageDataMap } from './dataLoader';
import { readIndexHtmlFile } from './indexHtml';

export async function handlePageRequest(
  url: URL,
  app: App,
  server: ViteDevServer,
  req: Connect.IncomingMessage,
  res: ServerResponse,
) {
  const pathname = decodeURI(url.pathname);

  const index = readIndexHtmlFile(app);

  const transformedIndex = await server.transformIndexHtml(
    pathname,
    index,
    req.originalUrl,
  );

  const { render } = (await server.ssrLoadModule(
    app.client.entry.server,
  )) as ServerEntryModule;

  const match = matchRouteInfo(url, app.pages.all);
  const page = app.pages.all[match?.index ?? -1];

  if (!page) {
    res.statusCode = 404;
    res.end('Not found.');
    return;
  }

  const data: ServerContext['data'] = await loadPageDataMap(
    url,
    app,
    page,
    server.ssrLoadModule,
  );

  const dataScript = buildDataScriptTag(data);

  const { html: appHtml, head } = await render(url, { data });

  const appFilePath = server.moduleGraph
    .getModuleById(`/${virtualModuleId.app}`)!
    .importedModules.values()
    .next().value.file;

  const stylesMap = await Promise.all(
    [
      appFilePath,
      ...page.layouts.map(
        (layout) => app.pages.getLayoutByIndex(layout)!.filePath,
      ),
      page.filePath,
    ].map((file) => getStylesByFile(server, file)),
  );

  // Prevent FOUC during development.
  const styles = [
    '<style type="text/css">',
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
export async function getStylesByFile(vite: ViteDevServer, file: string) {
  const files = await vite.moduleGraph.getModulesByFile(file);
  const node = Array.from(files ?? [])[0];

  if (!node) throw new Error(`Could not find node for ${file}`);

  const deps = new Set<ModuleNode>();
  await findModuleDeps(vite, node, deps);

  const styles: Record<string, string> = {};

  for (const dep of deps) {
    const parsed = new URL(dep.url, 'http://localhost/');
    const query = parsed.searchParams;

    if (
      styleRE.test(dep.file!) ||
      (query.has('svelte') && query.get('type') === 'style')
    ) {
      try {
        const mod = await vite.ssrLoadModule(dep.url, { fixStacktrace: false });
        styles[dep.url] = mod.default;
      } catch {
        // no-op
      }
    }
  }

  return styles;
}

export async function findModuleDeps(
  vite: ViteDevServer,
  node: ModuleNode,
  deps: Set<ModuleNode>,
) {
  const edges: Promise<void>[] = [];

  async function add(node: ModuleNode) {
    if (!deps.has(node)) {
      deps.add(node);
      await findModuleDeps(vite, node, deps);
    }
  }

  async function addByUrl(url: string) {
    const node = await vite.moduleGraph.getModuleByUrl(url);
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
