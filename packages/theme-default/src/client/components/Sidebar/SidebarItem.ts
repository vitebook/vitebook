import { FunctionalComponent, h, VNode } from 'vue';

import { isSidebarGroup, SidebarItem } from '../../../shared';
import SidebarItemGroup from './SidebarItemGroup.vue';
import SidebarItemLink from './SidebarItemLink.vue';

const SidebarItem: FunctionalComponent<{
  item: SidebarItem;
}> = ({ item }) => createSidebarTree(item, 0);

function createSidebarTree(item: SidebarItem, depth: number): VNode {
  if (!isSidebarGroup(item)) {
    return h(SidebarItemLink, { item, depth });
  }

  return h(
    SidebarItemGroup,
    { item, depth },
    {
      default: () =>
        item.children.map((child) => createSidebarTree(child, depth + 1))
    }
  );
}

export default SidebarItem;