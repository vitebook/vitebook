import { execRouteMatch } from 'router';

import type {
  ServerPageFile,
  StaticLoaderDataMap,
  StaticLoaderInput,
  StaticLoaderOutputMap,
} from './types';

export function createStaticLoaderInput(
  url: URL,
  page: ServerPageFile,
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

export function createStaticLoaderDataMap(map: StaticLoaderOutputMap) {
  const data: StaticLoaderDataMap = new Map();

  for (const id of map.keys()) {
    data.set(id, map.get(id)!.data ?? {});
  }

  return data;
}
