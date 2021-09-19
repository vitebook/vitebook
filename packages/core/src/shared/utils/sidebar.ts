import type {
  SidebarItem,
  SidebarItemGroup
} from '../types/default-theme/sidebar';

export function isSidebarGroup(item: SidebarItem): item is SidebarItemGroup {
  return Object.hasOwnProperty.call(item, 'children');
}
