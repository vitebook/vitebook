// Client

export type Page<
  DataModule extends DefaultPageDataModule = DefaultPageDataModule,
  ComponentModule = DefaultPageComponentModule
> = {
  /** Optional page type declared by a plugin to help identify specific pages client-side. */
  type?: string;
  /** Page name. Also used as route name if client-side router supports it. */
  name: string;
  /** Route path to this page such as `/components/button.html`. */
  path: string;
  /** Page component that's mounted client-side by router when this page's `path` is visited. */
  component: () => Promise<ComponentModule>;
  /** Additional data about this page. */
  data?: () => Promise<DataModule>;
};

export type Pages<
  DataModule extends DefaultPageDataModule = DefaultPageDataModule,
  ComponentModule = DefaultPageComponentModule
> = Page<DataModule, ComponentModule>[];

export type DefaultPageData = Record<string, unknown>;
export type DefaultPageComponent = unknown;

export type DefaultPageDataModule = { default: DefaultPageData };
export type DefaultPageComponentModule = { default: DefaultPageComponent };

// Server

export type ServerPage = Omit<Page, 'component' | 'data'> & {
  /** An absolute file path to a page component that will be dynamically imported client-side. */
  component: string;
  /** An absolute file path to page data that will be dynamically imported client-side. */
  data?: string;
};

export type ServerPages = ServerPage[];
