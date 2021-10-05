import type {
  SidebarItem,
  SidebarItemGroup
} from '../types/SidebarItemsConfig';

export function isSidebarGroup(item: SidebarItem): item is SidebarItemGroup {
  return Object.hasOwnProperty.call(item, 'children');
}
