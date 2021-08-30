export type DefaultThemeConfig<LocaleData = DefaultThemeLocaleData> = {
  /**
   * Specify the path of the homepage.
   *
   * This will be used for:
   *
   * - The logo link of the navbar.
   * - The back to home link of the 404 page
   *
   * @default '/'
   */
  homePath?: string;
  /**
   * Configuration of navbar.
   *
   * @default []
   */
  navbar?: (DefaultNavbarItem | DefaultNavbarGroup)[];
  /**
   * A relative URL from the project root to a logo. You can also place this inside the `<public>`
   * directory.
   *
   * @default '/logo.svg'
   */
  logo?: string;
  /**
   * Configuration of sidebar.
   *
   * @default {}
   */
  sidebar?: 'auto' | DefaultSidebarArrayConfig | DefaultSidebarObjectConfig;
  /**
   * A relative URL from the project root to a logo to be used in dark mode. You can also place
   * this inside the `<public>` directory. Set to `null` to disable logo in dark mode. Omit this
   * option to use `logo` in dark mode.
   *
   * @default '/logo-dark.svg'
   */
  logoDark?: string | null;
  /**
   * If set to `true`, a button to switch dark mode will be displayed in the navbar, and the initial
   * mode will be automatically set according to [prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme).
   *
   * @default true
   */
  darkMode?: boolean;
  /**
   * Specify the repository url of your project. This will be used as the link of the repository
   * link, which will be displayed as the last item of the navbar.
   */
  repo?: string;
  /**
   * Specify the repository label of your project. If you don't set this option explicitly, it
   * will be automatically inferred from the repo option.
   */
  repoLabel?: string;
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
  /**
   * Whether to show edit links at the bottom of documents. When clicked they'll take the user
   * to the respective document in the provided repo.
   *
   * @default true
   */
  editLinks?: boolean;
  /**
   * The text to be displayed for edit links. If you're setting localized text then set this
   * inside the `locales` property.
   *
   * @default 'Edit this page on GitHub'
   */
  editLinkText?: string;
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
   * Specify the repository url of your story source files. This will be used for generating
   * the edit this page link. If you don't set this option, it will use the `repo` option by default.
   * But if your story source files are in a different repository, you will need to set this option.
   */
  storyRepo?: string;
  /**
   * Specify the repository branch of your story source files. This will be used for
   * generating the edit this page link.
   */
  storyBranch?: string;
  /**
   * Specify the directory of your story source files in the repository. This will be used
   * for generating the edit this page link.
   */
  storyDir?: string;
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
  locales?: LocaleData;
};

export type DefaultNavbarItem =
  | string
  | {
      text: string;
      link: string;
    };

export type DefaultNavbarGroup = {
  text: string;
  items: DefaultNavbarItem[];
};

export type DefaultSidebarItem =
  | string
  | {
      text: string;
      link: string;
      children?: DefaultSidebarItem[];
    };

export type DefaultSidebarArrayConfig = DefaultSidebarItem[];

export type DefaultSidebarObjectConfig = {
  [path: string]: DefaultSidebarItem[];
};

export type DefaultThemeLocaleData = LocaleConfig<
  Pick<
    DefaultThemeConfig<unknown>,
    | 'navbar'
    | 'sidebar'
    | 'selectLanguageText'
    | 'selectLanguageAriaLabel'
    | 'selectLanguageName'
    | 'editLinkText'
    | 'lastUpdatedText'
  >
>;
