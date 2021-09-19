import type { SidebarGroup, SidebarItem } from '../types/default-theme/sidebar';

export function isSidebarGroup(item: SidebarItem): item is SidebarGroup {
  return Object.hasOwnProperty.call(item, 'children');
}
