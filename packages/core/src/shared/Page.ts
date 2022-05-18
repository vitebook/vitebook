// Client

import type { MarkdownMeta } from './Markdown';

export type ClientPage<Module extends ClientPageModule> = {
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
  loader: () => Promise<Module>;
};

export type ClientPageModule<DefaultExport = unknown> = {
  [id: string]: unknown;
  readonly default: DefaultExport;
  readonly meta?: MarkdownMeta;
};

export type LoadedClientPage<Module extends ClientPageModule> = Omit<
  ClientPage<Module>,
  'layouts'
> & {
  readonly $$loaded: true;
  readonly module: ClientPageModule;
  readonly component: Module['default'];
  readonly layouts: LoadedClientLayout<Module>[];
};

export type LoadedClientMarkdownPage<Module extends ClientPageModule> =
  LoadedClientPage<Module> & {
    readonly meta: MarkdownMeta;
  };

export type ClientLayout<Module> = {
  /** Layout name. */
  name: string;
  /** System file path relative to `<root>`. */
  rootPath: string;
  /** Layout module loader. Used to dynamically import client-side. */
  loader: () => Promise<Module>;
};

export type LoadedClientLayout<Module extends { default: unknown }> =
  ClientLayout<Module> & {
    readonly $$loaded: true;
    readonly module: Module;
    readonly component: Module['default'];
  };

// Server

export type ServerPage = Omit<ClientPage<never>, 'loader' | 'layouts'> & {
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

export type ServerLayout = Omit<ClientLayout<never>, 'loader'> & {
  /** Absolute system file path to page file. */
  filePath: string;
  /** The root directory that this layout belongs to. */
  owningDir: string;
};
