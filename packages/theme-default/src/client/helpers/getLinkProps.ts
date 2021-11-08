import {
  isLinkExternal,
  RouteLocation,
  SiteOptions,
  withBaseUrl,
} from '@vitebook/client';

import type { NavLink, SidebarLink } from '../../shared';

export function getLinkProps(
  link: NavLink | SidebarLink,
  site: SiteOptions,
  currentRoute: RouteLocation,
) {
  const isExternal = isLinkExternal(link.link, site.baseUrl);
  const routePath = currentRoute.path;

  let active = link.link === routePath;

  const normalizedLink = isExternal
    ? link.link
    : link.link.replace(/\..*$/, '.html');

  if (link.activeMatch) {
    active = new RegExp(link.activeMatch).test(currentRoute.decodedPath);
  } else {
    const itemPath = withBaseUrl(normalizedLink);
    active =
      itemPath === '/'
        ? itemPath === routePath
        : routePath.startsWith(itemPath);
  }

  return {
    active,
    external: isExternal,
    href: !isExternal ? withBaseUrl(normalizedLink) : normalizedLink,
    target: link.target ?? (isExternal ? `_blank` : undefined),
    rel: link.rel ?? (isExternal ? `noopener noreferrer` : undefined),
    'aria-label': link.ariaLabel,
  };
}
