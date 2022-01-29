import { isSidebarMenu, SidebarItem, SidebarLink } from '../../../shared';

export function flattenSidebarLinks(items: SidebarItem[]): SidebarLink[] {
  return items.reduce<SidebarLink[]>((links, item) => {
    if (!isSidebarMenu(item)) {
      links.push({ text: item.text, link: item.link });
    } else {
      links = [...links, ...flattenSidebarLinks(item.children)];
    }

    return links;
  }, []);
}
