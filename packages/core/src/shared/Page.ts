// Client

import type { MarkdownMeta } from './Markdown';

export type ClientPage = {
  /** Page name which can be used to identify route. */
  name?: string;
  /** Route to this page such as `/pages/page.html`. */
  route: string;
  /** System file path relative to `<root>`. */
  rootPath: string;
  /** Additional page metadata. */
  context: Record<string, unknown>;
  /** Page layouts identifiers. */
  layouts: number[];
  /** Page module loader. Used to dynamically import page module client-side. */
  loader: () => Promise<ClientPageModule>;
};

export type ClientPageModule = {
  [id: string]: unknown;
  readonly default: unknown;
  readonly meta?: MarkdownMeta;
};

export type LoadedClientPage = Omit<ClientPage, 'layouts'> & {
  readonly $$loaded: true;
  readonly module: ClientPageModule;
  readonly default: unknown;
  readonly layouts: LoadedClientLayout[];
};

export type LoadedClientMarkdownPage = LoadedClientPage & {
  readonly meta: MarkdownMeta;
};

export type ClientLayout = {
  /** Layout name. */
  name: string;
  /** System file path relative to `<root>`. */
  rootPath: string;
  /** Layout module loader. Used to dynamically import client-side. */
  loader: () => Promise<ClientLayoutModule>;
};

export type ClientLayoutModule = ClientPageModule;

export type LoadedClientLayout = ClientLayout & {
  readonly $$loaded: true;
  readonly module: ClientLayoutModule;
  readonly default: unknown;
};

// Server

export type ServerPage = Omit<ClientPage, 'loader' | 'layouts'> & {
  /** Module id used by the client-side router to dynamically load this page module.  */
  id: string;
  /** Absolute system file path to page file.  */
  filePath: string;
  /** Client-side route to this page inferred from the page file path.  */
  route: string;
  /** Page layout name. */
  layoutName: string;
  /**
   * Indentifies layout files that belong to this page. Each number is an index to a layout
   * client layout file in the `layouts` store.
   */
  layouts: number[];
  /**
   * Additional data to be included with the page. This will be included in the client-side
   * response.
   */
  context: Record<string, unknown>;
};

export type ServerLayout = Omit<ClientLayout, 'loader'> & {
  /** Absolute system file path to page file. */
  filePath: string;
  /** The root directory that this layout belongs to. */
  owningDir: string;
};
