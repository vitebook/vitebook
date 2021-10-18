export type NavbarItemsConfig = (NavLink | NavMenu)[];

export type NavItem = {
  text: string;
  target?: string;
  rel?: string;
  ariaLabel?: string;
  activeMatch?: string;
};

export type NavLink = NavItem & {
  link: string;
};

export type NavMenu = NavItem & {
  menu: NavLink[];
};
