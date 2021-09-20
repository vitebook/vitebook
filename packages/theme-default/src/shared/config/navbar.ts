export type NavbarItemsConfig = (NavItemLink | NavItemWithMenu)[];

export type NavItem = {
  text: string;
  target?: string;
  rel?: string;
  ariaLabel?: string;
  activeMatch?: string;
};

export type NavItemLink = NavItem & {
  link: string;
};

export type NavItemWithMenu = NavItem & {
  menu: NavItemLink[];
};
