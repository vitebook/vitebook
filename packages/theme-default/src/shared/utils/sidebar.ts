import type { SidebarItem, SidebarItemGroup } from '../config/sidebar';

export function isSidebarGroup(item: SidebarItem): item is SidebarItemGroup {
  return Object.hasOwnProperty.call(item, 'children');
}
