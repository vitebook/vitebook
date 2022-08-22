import {
  prettyJsonStr,
  ServerLayout,
  ServerPage,
  stripImportQuotesFromJson,
} from '../../../../shared';

const STRIP_URL_PATTERN_QUOTES_RE = /"new URLPattern(.*?)"/g;

export function loadPagesModule(pages: ServerPage[]) {
  return `export default ${stripImportQuotesFromJson(
    prettyJsonStr(
      pages.map((page) => ({
        name: page.name,
        rootPath: page.rootPath,
        route: {
          ...page.route,
          // initialized late on client to allow polyfill to be installed.
          pattern: undefined,
        },
        ext: page.ext,
        layoutName: page.layoutName,
        layouts: page.layouts,
        context:
          Object.keys(page.context).length > 0 ? page.context : undefined,
        loader: `() => import('${page.id}')`,
      })),
    ),
  )}`.replace(STRIP_URL_PATTERN_QUOTES_RE, 'new URLPattern$1');
}

export function loadLayoutsModule(layouts: ServerLayout[]) {
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
