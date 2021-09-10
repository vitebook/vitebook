import { EXTERNAL_URL_RE } from '@vitebook/core/shared';

import { useLocalizedSiteOptions } from '../composables/useLocalizedSiteOptions';

/** Join two paths by resolving the slash collision. */
export function joinPath(base: string, path: string): string {
  return `${base}${path}`.replace(/\/+/g, '/');
}

export function withBaseUrl(path: string): string {
  const siteConfig = useLocalizedSiteOptions();
  const baseUrl = siteConfig.value.baseUrl;

  return EXTERNAL_URL_RE.test(path) || path.startsWith(baseUrl)
    ? path
    : joinPath(baseUrl, path);
}
