import type { NavbarItemsConfig } from './navbar.js';
import type { MultiSidebarItemsConfig, SidebarItemsConfig } from './sidebar.js';

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
   * A relative URL from the project root to a logo. You can also place this inside the `<public>`
   * directory.
   *
   * @default '/logo.svg'
   */
  logo?: string;
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
  darkMode?: DarkModeLocaleConfig;
  /**
   * Remote Git repository configuration.
   */
  remoteGitRepo?: DefaultThemeRemoteGitRepoLocaleConfig;
  /**
   * Navbar configuration.
   */
  navbar?: DefaultThemeNavbarLocaleConfig;
  /**
   * Sidebar configuration.
   */
  sidebar?: DefaultThemeSidebarLocaleConfig;
  /**
   * Markdown documentation configuration.
   */
  markdown?: DefaultThemeMarkdownLocaleConfig;
  /**
   * Home page configuration.
   *
   * @default false
   */
  homePage?: DefaultThemeHomePageLocaleConfig | false;
  /**
   * Not found page (404) configuration.
   */
  notFoundPage?: DefaultThemeNotFoundPageLocaleConfig;
};

export type DefaultThemeRemoteGitRepoLocaleConfig = {
  /**
   * Specify the repository url of your project. This will be used as the link of the repository
   * link, which will be displayed as the last item of the navbar.
   */
  url?: string;
  /**
   * Specify the repository label of your project. If you don't set this option explicitly, it
   * will be automatically inferred from the `url` option.
   */
  label?: string;
};

export type DefaultThemeNavbarLocaleConfig = {
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

export type DarkModeLocaleConfig = {
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

export type DefaultThemeSidebarLocaleConfig = {
  /**
   * Sidebar items.
   *
   * @default {}
   */
  items?: SidebarItemsConfig | MultiSidebarItemsConfig;
  /**
   * A11y text for sidebar toggle button.
   */
  toggleAriaLabel?: string;
  /**
   * Specify the text to be displayed inside the back to main menu button in the sidebar.
   *
   * @default 'Back to main menu'
   */
  backToMainMenuText?: string;
};

export type DefaultThemeMarkdownLocaleConfig = {
  /**
   * Whether to show edit links at the bottom of documents. When clicked they'll take the user
   * to the respective document in the provided repo.
   *
   * @default true
   */
  editLink?: boolean;
  /**
   * Specify the pattern of the edit this page link. This will be used for generating the edit this
   * page link.
   *
   * **Patterns:**
   * - `:repo` - The stories repo URL.
   * - `:branch` - The stories repo branch.
   * - `:path` - The path of the story source file.
   *
   * @default ':repo/edit/:branch/:path'
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
   * Remote Git repository configuration. Used for generating the 'edit this page' link.
   */
  remoteGitRepo?: {
    /**
     * Specify the repository url of your documentation files. This will be used for generating
     * the edit this page link. If you don't set this option, it will use the `repo` option by .
     * But if your files are in a different repository, you will need to set this option.
     */
    url?: string;
    /**
     * Specify the repository branch of your documentation files. This will be used for
     * generating the edit this page link.
     */
    branch?: string;
    /**
     * Specify the directory of your documentation files in the repository. This will be used
     * for generating the edit this page link.
     */
    dir?: string;
  };
  /**
   * Enable the last updated timestamp or not.
   *
   * @default true
   */
  lastUpdated?: boolean;
  /**
   * Specify the text of the last updated timestamp label.
   *
   * @default 'Last Updated'
   */
  lastUpdatedText?: string;
};

export type DefaultThemeHomePageLocaleConfig = {
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

export type DefaultThemeNotFoundPageLocaleConfig = {
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
  logo: '/logo.svg',

  a11y: {
    openInNewWindow: 'open in new window'
  },

  remoteGitRepo: {
    // url: undefined,
    // label: undefined,
  },

  darkMode: {
    enabled: true,
    buttonAriaLabel: 'Toggle dark mode'
  },

  navbar: {
    items: [],
    languageMenu: {
      selectLanguageText: 'Languages',
      selectLanguageAriaLabel: 'Select language'
      // selectLanguageName: undefined,
    }
  },

  sidebar: {
    items: 'auto',
    toggleAriaLabel: 'Toggle sidebar',
    backToMainMenuText: 'Back to main menu'
  },

  markdown: {
    editLink: true,
    editLinkText: 'Edit this page',
    editLinkPattern: ':repo/edit/:branch/:path',
    lastUpdated: true,
    lastUpdatedText: 'Last Updated',
    remoteGitRepo: {
      // url: undefined,
      // branch: undefined,
      // dir: undefined,
    }
  },

  homePage: false,

  notFoundPage: {
    message: 'Oops, something went wrong.',
    goHomeText: 'Take me home',
    goBackText: 'Go back'
  }
};
