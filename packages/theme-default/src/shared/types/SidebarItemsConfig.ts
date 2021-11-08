export type SidebarItemsConfig = SidebarItem[] | 'auto' | false;

export type MultiSidebarItemsConfig<SidebarConfig = unknown> = {
  [path: string]:
    | SidebarItemsConfig
    | ({ items: SidebarItemsConfig } & SidebarConfig);
};

export type SidebarItem = SidebarLink | SidebarMenu;

export type SidebarLink = {
  text: string;
  link: string;
  type?: string;
  target?: string;
  rel?: string;
  ariaLabel?: string;
  activeMatch?: string;
};

export type SidebarMenu = {
  text: string;
  collapsible?: boolean;
  children: SidebarItem[];
};
