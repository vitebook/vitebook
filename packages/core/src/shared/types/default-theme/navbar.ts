export type NavbarItemsConfig = (NavItemLink | NavItemGroup)[];

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

export type NavItemGroup = NavItem & {
  children: NavItemLink[];
};
