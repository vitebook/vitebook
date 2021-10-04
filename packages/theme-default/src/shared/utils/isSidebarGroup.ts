import type {
  SidebarItem,
  SidebarItemGroup
} from '../config/SidebarItemsConfig';

export function isSidebarGroup(item: SidebarItem): item is SidebarItemGroup {
  return Object.hasOwnProperty.call(item, 'children');
}
