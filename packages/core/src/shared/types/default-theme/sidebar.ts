export type SidebarItemsConfig = SidebarItem[] | 'auto' | false;

export type MultiSidebarItemsConfig = {
  [path: string]: SidebarItemsConfig;
};

export type SidebarItem = SidebarLink | SidebarGroup;

export type SidebarLink = {
  text: string;
  link: string;
};

export type SidebarGroup = {
  text: string;
  collapsible?: boolean;
  children: SidebarItem[];
};
