// Client

export type Page<PageModule = DefaultPageModule> = {
  /** Optional page type declared by a plugin to help identify specific pages client-side. */
  type?: string;
  /** Page name. Also used as route name if client-side router supports it. */
  name?: string;
  /** Route path to this page such as `/pages/page.html`. */
  route: string;
  /** Page module loader. Used to dynamically import page module client-side. */
  loader: () => Promise<PageModule>;
};

export type Pages<PageModule = DefaultPageModule> = Page<PageModule>[];
export type DefaultPageModule = { default?: unknown };

// Server

export type ServerPage = Omit<Page, 'loader'> & {
  /**
   * Page module id used by the client-side router to dynamically load this page module. If not
   * resolved by a plugin, it'll default to the page file path.
   */
  id: string;

  /**
   * Absolute system file path to page file.
   */
  filePath: string;

  /**
   * Client-side route to this page. If not resolved by a plugin, it'll be inferred from the page
   * file path such as `/pages/page.html`.The client-side router is responsible for loading the
   * page module when this route is visited.
   */
  route: string;
};

export type ResolvedPage = Partial<ServerPage>;
