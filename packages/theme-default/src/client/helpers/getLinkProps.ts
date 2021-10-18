import {
  isLinkExternal,
  RouteLocation,
  SiteOptions,
  withBaseUrl
} from '@vitebook/client';

import type { NavLink, SidebarLink } from '../../shared';

export function getLinkProps(
  link: NavLink | SidebarLink,
  site: SiteOptions,
  currentRoute: RouteLocation
) {
  const isExternal = isLinkExternal(link.link, site.baseUrl);
  const routePath = currentRoute.path;

  let active = link.link === routePath;

  if (link.activeMatch) {
    active = new RegExp(link.activeMatch).test(currentRoute.decodedPath);
  } else {
    const itemPath = withBaseUrl(link.link);
    active =
      itemPath === '/'
        ? itemPath === routePath
        : routePath.startsWith(itemPath);
  }

  return {
    active,
    external: isExternal,
    href: !isExternal ? withBaseUrl(link.link) : link.link,
    target: link.target ?? (isExternal ? `_blank` : undefined),
    rel: link.rel ?? (isExternal ? `noopener noreferrer` : undefined),
    'aria-label': link.ariaLabel
  };
}
