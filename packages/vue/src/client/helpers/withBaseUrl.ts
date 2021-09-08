import { EXTERNAL_URL_RE } from '@vitebook/core/shared';

import { useSiteOptions } from '../composables/useSiteOptions';

/** Join two paths by resolving the slash collision. */
export function joinPath(base: string, path: string): string {
  return `${base}${path}`.replace(/\/+/g, '/');
}

export function withBaseUrl(path: string): string {
  const siteConfig = useSiteOptions();

  return EXTERNAL_URL_RE.test(path)
    ? path
    : joinPath(siteConfig.value.baseUrl, path);
}
