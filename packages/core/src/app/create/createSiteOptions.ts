import type { SiteConfig, SiteOptions } from '../../shared/index.js';

export const createSiteOptions = ({
  baseUrl = '/',
  lang = 'en-US',
  title = '',
  description = '',
  head = [],
  locales = {},
  theme = {}
}: SiteConfig): SiteOptions => ({
  baseUrl,
  lang,
  title,
  description,
  head,
  locales,
  theme
});
