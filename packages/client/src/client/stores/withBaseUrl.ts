import { EXTERNAL_URL_RE } from '@vitebook/core';
import { derived, get } from 'svelte/store';

import { siteOptions } from './siteOptions';

/** Join two paths by resolving the slash collision. */
export function joinPath(base: string, path: string): string {
  return `${base}${path}`.replace(/\/+/g, '/');
}

export function createWithBaseUrlStore(path: string) {
  return derived(siteOptions, (site) => withBaseUrl(path, site));
}

export function withBaseUrl(path: string, site = get(siteOptions)): string {
  const baseUrl = site.baseUrl;
  return EXTERNAL_URL_RE.test(path) || path.startsWith(baseUrl)
    ? path
    : joinPath(baseUrl, path);
}
