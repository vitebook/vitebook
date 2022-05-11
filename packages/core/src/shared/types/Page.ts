// Client

import type { SvelteConstructor } from './Svelte';

export type Page<Context = DefaultPageContext> = {
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

export type PageModule = {
  [id: string]: unknown;
  default: SvelteConstructor;
};

export type Pages = Page[];

export type LoadedPage<Context = DefaultPageContext> = Page<Context> & {
  mod: PageModule;
  component: SvelteConstructor;
};

export type VirtualPagesModule = {
  default: Pages;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DefaultPageContext = Record<string, any>;

// Server

export type ServerPage<Context = DefaultPageContext> = Omit<Page, 'loader'> & {
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
