// Client

export type Page<
  ComponentModule = DefaultPageComponentModule,
  DataModule extends DefaultPageDataModule = DefaultPageDataModule
> = {
  /** Optional page type declared by a plugin to help identify specific pages client-side. */
  type?: string;
  /** Page name. Also used as route name if client-side router supports it. */
  name?: string;
  /** Route path to this page such as `/components/button.html`. */
  path: string;
  /** Page component that's mounted client-side by router when this page's `path` is visited. */
  component: () => Promise<ComponentModule>;
  /** Additional data about this page. */
  data?: () => Promise<DataModule>;
};

export type Pages<
  ComponentModule = DefaultPageComponentModule,
  DataModule extends DefaultPageDataModule = DefaultPageDataModule
> = Page<ComponentModule, DataModule>[];

export type DefaultPageData = Record<string, unknown>;
export type DefaultPageComponent = unknown;

export type DefaultPageDataModule = { default: DefaultPageData };
export type DefaultPageComponentModule = { default: DefaultPageComponent };

// Server

export type ServerPage<Meta = unknown> = Omit<
  Page,
  'component' | 'data' | 'path'
> & {
  /**
   * Absolute system file path to page.
   */
  filePath: string;

  /**
   * Relative system file path to page from `srcDir`.
   */
  relativeFilePath: string;

  /**
   * An absolute, relative, or virtual file path to a page component module that will be
   * dynamically imported client-side. If the path is relative, it'll be resolved relative to the
   * page file directory.
   *
   * Any application path aliases are also resolved in this path.
   */
  component: string;

  /**
   * Route path to this page such as `/components/button.html`. If not defined it'll be inferred
   * by the file path.
   */
  path?: string;

  /**
   * An absolute or virtual file path to a page data module that will be dynamically imported
   * client-side.
   *
   * Any application path aliases are also resolved in this path.
   */
  data?: string;

  /**
   * Optional page metadata to save when processing server-side. This is not included client-side.
   */
  meta?: Meta;
};

export type ServerPages = ServerPage<unknown>[];

export type ResolvedPage = Omit<
  ServerPage,
  'component' | 'filePath' | 'relativeFilePath'
> & {
  /**
   * An absolute, relative, or virtual file path to a page component module that will be
   * dynamically imported client-side. If the path is relative, it'll be resolved relative to the
   * page file directory.
   *
   * - If no component path is provided it'll default to the relative file path.
   * - Any application path aliases are also resolved in this path.
   */
  component?: string;
};
