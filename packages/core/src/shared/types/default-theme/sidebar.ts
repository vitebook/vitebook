export type SidebarItemsConfig = SidebarItem[] | 'auto' | false;

export type SidebarItem = SidebarLink | SidebarGroup;

export type SidebarLink = {
  text: string;
  link: string;
};

export type SidebarGroup = {
  text: string;
  link?: string;
  collapsible?: boolean;
  children: SidebarItem[];
};
