import type { ServerLayoutFile, ServerPageFile } from 'server/types';
import { prettyJsonStr, stripImportQuotesFromJson } from 'shared/utils/json';

const STRIP_URL_PATTERN_QUOTES_RE = /"new URLPattern(.*?)"/g;

export function loadPagesModule(pages: ServerPageFile[]) {
  return `export default ${stripImportQuotesFromJson(
    prettyJsonStr(
      pages.map((page) => ({
        rootPath: page.rootPath,
        route: {
          ...page.route,
          // initialized late on client to allow polyfill to be installed.
          pattern: undefined,
        },
        ext: page.ext,
        layoutName: page.layoutName,
        layouts: page.layouts,
        loader: `() => import('${page.id}')`,
      })),
    ),
  )}`.replace(STRIP_URL_PATTERN_QUOTES_RE, 'new URLPattern$1');
}

export function loadLayoutsModule(layouts: ServerLayoutFile[]) {
  return `export default ${stripImportQuotesFromJson(
    prettyJsonStr(
      layouts.map((layout) => {
        return {
          name: layout.name,
          rootPath: layout.rootPath,
          loader: `() => import('${layout.id}')`,
        };
      }),
    ),
  )}`;
}
