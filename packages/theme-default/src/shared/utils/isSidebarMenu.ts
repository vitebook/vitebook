import type { SidebarItem, SidebarMenu } from '../types/SidebarItemsConfig';

export function isSidebarMenu(item: SidebarItem): item is SidebarMenu {
  return Object.hasOwnProperty.call(item, 'children');
}
