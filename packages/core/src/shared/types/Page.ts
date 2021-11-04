// Client

import type { PageMeta } from './PageMeta';

export type Page<
  PageModule = DefaultPageModule,
  Context extends DefaultPageContext = DefaultPageContext,
> = {
  /** Optional page type declared by a plugin to help identify specific pages client-side. */
  type?: string;
  /** Page name. Also used as route name if client-side router supports it. */
  name?: string;
  /** Route path to this page such as `/pages/page.html`. */
  route: string;
  /** System file path relative to `<root>`. */
  rootPath: string;
  /** Optional page data included by a plugin. */
  context?: Context;
  /** Page module loader. Used to dynamically import page module client-side. */
  loader: () => Promise<PageModule>;
};

export type DefaultPageContext = Record<string, unknown>;

export type DefaultLoadedPage<
  PageModule extends DefaultPageModule = DefaultPageModule,
  Context extends DefaultPageContext = DefaultPageContext,
> = Page<PageModule, Context> & {
  meta: NonNullable<PageModule['__type']>;
  module: PageModule;
};

export type Pages<PageModule extends DefaultPageModule = DefaultPageModule> =
  Page<PageModule>[];

export type PageMetaBuilder<PageMeta> =
  | PageMeta
  | ((page: Page, mod: DefaultPageModule) => PageMeta | Promise<PageMeta>);

export type DefaultPageModule<
  DefaultExport = unknown,
  PageMetaExport = PageMeta,
> = {
  /** type def (doesn't actually exist). */
  __type?: PageMetaExport;
  default: DefaultExport;
  __pageMeta?: PageMetaBuilder<PageMetaExport>;
};

export type VirtualPagesModule = {
  default: Page[];
};

// Server

export type ServerPage<
  Context extends DefaultPageContext = DefaultPageContext,
> = Omit<Page, 'loader'> & {
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

  /**
   * Additional data to be included with the page. This will be included in the client-side
   * response.
   */
  context?: Context;
};

export type ResolvedPage = Partial<ServerPage>;
