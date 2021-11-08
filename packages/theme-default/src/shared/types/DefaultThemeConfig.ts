import type { NavbarItemsConfig } from './NavbarItemsConfig';
import type {
  MultiSidebarItemsConfig,
  SidebarItemsConfig,
} from './SidebarItemsConfig';

export type DefaultThemeConfig = DefaultThemeLocaleData & {
  /**
   * Localized text mappings.
   *
   * @example
   * {
   *   '/en-US': {
   *     editLinkText: 'Edit this page on GitHub'
   *     // ...
   *   },
   *   '/zh': {
   *     editLinkText: '在 GitHub 上编辑此页'
   *     // ...
   *   }
   * }
   */
  locales?: DefaultThemeLocaleConfig;
};

export type DefaultThemeLocaleData = {
  /**
   * Miscellaneous A11y configuration options.
   */
  a11y?: {
    /**
     * A11y text for an outbound link.
     */
    openInNewWindow?: string;
  };
  /**
   * Dark mode configuration.
   */
  darkMode?: DarkModeConfig;
  /**
   * Remote Git repository configuration.
   */
  remoteGitRepo?: RemoteGitRepoConfig;
  /**
   * Social platform configurations.
   */
  socials?: SocialsConfig;
  /**
   * Navbar configuration.
   *
   * @default false
   */
  navbar?: false | NavbarConfig;
  /**
   * Sidebar configuration.
   */
  sidebar?: SidebarConfig;
  /**
   * Markdown documentation configuration.
   */
  markdown?: MarkdownConfig;
  /**
   * Home page configuration.
   *
   * @default false
   */
  homePage?: HomePageConfig | false;
  /**
   * Not found page (404) configuration.
   */
  notFoundPage?: NotFoundPageConfig;
};

export type SocialsConfig = {
  discord?:
    | string
    | {
        label?: string;
        link: string;
      };
  twitter?:
    | string
    | {
        label?: string;
        link: string;
      };
};

export type RemoteGitRepoConfig = {
  /**
   * Specify the repository URL of your project. This will be used as the link of the repository
   * link, which will be displayed as the last item of the navbar.
   */
  url?: string;
  /**
   * Specify the repository label of your project. If you don't set this option explicitly, it
   * will be automatically inferred from the `url` option.
   */
  label?: string;
};

export type NavbarConfig = {
  /**
   * Navbar items.
   *
   * @default []
   */
  items?: NavbarItemsConfig;
  /**
   * Language dropdown menu configuration.
   */
  languageMenu?: {
    /**
     * Specify the text of the select language menu. The select language menu will appear next to the
     * repository button in the navbar when you set multiple locales in your site config.
     */
    selectLanguageText?: string;
    /**
     * Specify the aria-label attribute of the select language menu. This is mainly for a11y purposes.
     */
    selectLanguageAriaLabel?: string;
    /**
     * Specify the name of the language of a locale. This option will only take effect inside the
     * `locales` of your theme config. It will be used as the language name of the locale, which will
     * be displayed in the select language menu.
     */
    selectLanguageName?: string;
  };
};

export type DarkModeConfig = {
  /**
   * If set to `true`, a button to switch dark mode will be displayed in the navbar, and the initial
   * mode will be automatically set according to [prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme).
   *
   * @default true
   */
  enabled?: boolean;
  /**
   * A11y text for dark mode toggle button.
   *
   * @default 'Toggle dark mode'
   */
  buttonAriaLabel?: string;
};

export type MultiSidebarStyleConfig = Partial<
  Pick<SidebarConfig, 'style' | 'iconColors'>
>;

export type SidebarConfig = {
  /**
   * Sidebar items.
   *
   * @default {}
   */
  items?: SidebarItemsConfig | MultiSidebarItemsConfig<MultiSidebarStyleConfig>;
  /**
   * Specify the style of the sidebar.
   */
  style?: 'explorer' | 'docs';
  /**
   * Whether root folders in `<srcDir>` should be treated as categories. This will simply
   * create sections in the sidebar.
   */
  categories?: boolean;
  /**
   * Specify the text to be displayed inside the back to main menu button in the sidebar.
   *
   * @default 'Back to main menu'
   */
  backToMainMenuText?: string;
  /**
   * Whether to enable sidebar icon colors. By default they're only set when the sidebar item is
   * active.
   *
   * @default false
   */
  iconColors?: boolean;
  /**
   * A11y text for menu toggle button.
   *
   * @default 'Toggle sidebar menu'
   */
  toggleAriaLabel?: string;
};

export type MarkdownConfig = {
  /**
   * Whether the floating table of contents to the right of markdown pages should be enabled by
   * default. This can be configured on a page-by-page basis via the `toc` frontmatter property.
   *
   * @default false
   */
  toc?: boolean;
  /**
   * Whether to show edit links at the bottom of documents. When clicked they'll take the user
   * to the respective document in the provided repo.
   *
   * @default false
   */
  editLink?: boolean;
  /**
   * Specify the pattern of the edit this page link. This will be used for generating the edit this
   * page link.
   *
   * **Patterns:**
   * - `:repo` - The repo URL.
   * - `:branch` - The repo branch.
   * - `:path` - The path of the source file.
   *
   * @default ':repo/edit/:branch/:path' - Changes depending on repo.
   */
  editLinkPattern?: string;
  /**
   * The text to be displayed for edit links. If you're setting localized text then set this
   * inside the `locales` property.
   *
   * @default 'Edit this page on GitHub'
   */
  editLinkText?: string;
  /**
   * Enable the last updated timestamp or not.
   *
   * @default false
   */
  lastUpdated?: boolean;
  /**
   * Specify the text of the last updated timestamp label.
   *
   * @default 'Last updated on'
   */
  lastUpdatedText?: string;
  /**
   * Whether the previous page link at the bottom of markdown pages is enabled.
   *
   * @default false
   */
  prevLink?: boolean;
  /**
   * Specify text to be displayed inside previous page link at the bottom of markdown pages.
   *
   * @default 'Previous'
   */
  prevLinkText?: string;
  /**
   * Whether the next page link at the bottom of markdown pages is enabled.
   *
   * @default false
   */
  nextLink?: boolean;
  /**
   * Specify text to be displayed inside previous page link at the bottom of markdown pages.
   *
   * @default 'Next'
   */
  nextLinkText?: string;
  /**
   * Remote Git repository configuration. Used for generating the 'Edit this page' link.
   */
  remoteGitRepo?: {
    /**
     * Specify the repository URL of your documentation files. This will be used for generating
     * the edit this page link. If you don't set this option, it will be inferred from the
     * root `remoteGitRepo.url` option.
     *
     * @example 'https://bitbucket.org'
     * @example 'https://github.com'
     * @example 'https://gitlab.com'
     */
    url?: string;
    /**
     * Specify the repository branch of your documentation files. This will be used for
     * generating the edit this page link.
     *
     * @default 'main'
     */
    branch?: string;
    /**
     * Specify the directory of your documentation files in the repository. This will be used
     * for generating the edit this page link.
     *
     * @default ''
     */
    dir?: string;
  };
};

export type HomePageConfig = {
  /**
   * Large text displayed at the top of the page in the hero.
   */
  heroText?: string;
  /**
   * Text to be displayed inside the primary button link in the hero.
   */
  primaryActionText?: string;
  /**
   * URL of the primary button link.
   */
  primaryActionLink?: string;
  /**
   * Text to be displayed inside the secondary button link in the hero.
   */
  secondaryActionText?: string;
  /**
   * URL of the secondary button link.
   */
  secondaryActionLink?: string;
  /**
   * Feature items to be displayed below the hero.
   */
  features?: DefaultThemeHomePageFeature[];
  /**
   * Text to be displayed in the footer.
   */
  footer?: string;
};

export type DefaultThemeHomePageFeature = {
  title?: string;
  body?: string;
};

export type NotFoundPageConfig = {
  /**
   * Displayed message.
   *
   * @default 'Oops, something went wrong.'
   */
  message?: string;
  /**
   * Displayed text inside back to home button.
   *
   * @default 'Take me home'
   */
  goHomeText?: string;
  /**
   * Displayed text inside go to previous page button.
   *
   * @default 'Go back'
   */
  goBackText?: string;
};

export type DefaultThemeLocaleConfig = Record<string, DefaultThemeLocaleData>;

export const defaultThemeLocaleOptions: Required<DefaultThemeLocaleData> = {
  a11y: {
    openInNewWindow: 'open in new window',
  },

  remoteGitRepo: {
    // url: undefined,
    // label: undefined,
  },

  socials: {
    // discord: undefined,
    // twitter: undefined
  },

  darkMode: {
    enabled: true,
    buttonAriaLabel: 'Toggle dark mode',
  },

  navbar: false,

  sidebar: {
    items: 'auto',
    style: 'explorer',
    categories: false,
    iconColors: false,
    backToMainMenuText: 'Back to main menu',
    toggleAriaLabel: 'Toggle sidebar menu',
  },

  markdown: {
    toc: false,
    prevLink: false,
    prevLinkText: 'Previous',
    nextLink: false,
    nextLinkText: 'Next',
    editLink: false,
    editLinkText: 'Edit this page',
    editLinkPattern: ':repo/edit/:branch/:path',
    lastUpdated: false,
    lastUpdatedText: 'Last updated on',
    remoteGitRepo: {
      // url: undefined,
      // branch: undefined,
      // dir: undefined,
    },
  },

  homePage: false,

  notFoundPage: {
    message: 'Oops, something went wrong.',
    goHomeText: 'Take me home',
    goBackText: 'Go back',
  },
};
