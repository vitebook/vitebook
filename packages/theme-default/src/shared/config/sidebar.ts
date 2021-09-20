export type SidebarItemsConfig = SidebarItem[] | 'auto' | false;

export type MultiSidebarItemsConfig = {
  [path: string]: SidebarItemsConfig;
};

export type SidebarItem = SidebarItemLink | SidebarItemGroup;

export type SidebarItemLink = {
  text: string;
  link: string;
  target?: string;
  rel?: string;
  ariaLabel?: string;
  activeMatch?: string;
};

export type SidebarItemGroup = {
  text: string;
  collapsible?: boolean;
  children: SidebarItem[];
};
