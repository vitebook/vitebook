import {
  isLinkExternal,
  RouteLocation,
  SiteOptions,
  withBaseUrl
} from '@vitebook/client';

import type { NavItemLink, SidebarItemLink } from '../../shared';

export function getLinkProps(
  link: NavItemLink | SidebarItemLink,
  site: SiteOptions,
  currentRoute: RouteLocation
) {
  const isExternal = isLinkExternal(link.link, site.baseUrl);
  const routePath = decodeURI(currentRoute.path);

  let active = link.link === routePath;

  if (link.activeMatch) {
    active = new RegExp(link.activeMatch).test(routePath);
  } else {
    const itemPath = withBaseUrl(link.link);
    active =
      itemPath === '/'
        ? itemPath === routePath
        : routePath.startsWith(itemPath);
  }

  return {
    class: `link${active ? ' active' : ''}${isExternal ? ' external' : ''}`,
    href: !isExternal ? withBaseUrl(link.link) : link.link,
    target: link.target ?? (isExternal ? `_blank` : undefined),
    rel: link.rel ?? (isExternal ? `noopener noreferrer` : undefined),
    'aria-label': link.ariaLabel
  };
}
