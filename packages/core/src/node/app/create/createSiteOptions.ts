import type { SiteConfig, SiteOptions } from '../../../shared';

export const createSiteOptions = ({
  baseUrl = '/',
  lang = 'en-US',
  langLabel = 'English',
  title = '',
  description = '',
  head = [],
  locales = {},
  theme = {},
}: SiteConfig): SiteOptions => ({
  baseUrl,
  lang,
  langLabel,
  title,
  description,
  head,
  locales,
  theme,
});
