// Client

import type { MarkdownMeta } from './Markdown';

export type ClientPage = {
  /** Page name which can be used to identify route. */
  readonly name?: string;
  /** Route to this page such as `/pages/page.html`. */
  readonly route: string;
  /** System file path relative to `<root>`. */
  readonly rootPath: string;
  /** Additional page metadata. */
  readonly context: Record<string, unknown>;
  /** Page layouts identifiers. */
  readonly layouts: number[];
  /** Page module loader. Used to dynamically import page module client-side. */
  readonly loader: () => Promise<ClientPageModule>;
};

export type ClientLoadedData = Record<string, unknown>;

export type ClientPageModule = {
  readonly [id: string]: unknown;
  readonly default: unknown;
  readonly meta?: MarkdownMeta;
  readonly loader?: ServerLoader;
};

export type LoadedClientPage = Omit<ClientPage, 'layouts'> & {
  readonly $$loaded: true;
  readonly module: ClientPageModule;
  readonly default: unknown;
  readonly layouts: LoadedClientLayout[];
  readonly data: ClientLoadedData;
};

export type LoadedClientMarkdownPage = LoadedClientPage & {
  readonly meta: MarkdownMeta;
};

export type ClientLayout = {
  /** Layout name. */
  readonly name: string;
  /** System file path relative to `<root>`. */
  readonly rootPath: string;
  /** Layout module loader. Used to dynamically import client-side. */
  readonly loader: () => Promise<ClientLayoutModule>;
};

export type ClientLayoutModule = ClientPageModule;

export type LoadedClientLayout = ClientLayout & {
  readonly $$loaded: true;
  readonly module: ClientLayoutModule;
  readonly default: unknown;
  readonly data: ClientLoadedData;
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
  /** Whether the page has a data `loader` function. */
  hasLoader: boolean;
};

export type ServerLayout = Omit<ClientLayout, 'loader'> & {
  /** Module id used by the client-side router to dynamically load this layout module.  */
  id: string;
  /** Absolute system file path to page file. */
  filePath: string;
  /** The root directory that this layout belongs to. */
  owningDir: string;
  /** Whether the layout has a data `loader` function. */
  hasLoader: boolean;
};

export type ServerLoadedData = Record<string, unknown>;

export type ServerLoaderInput = {
  route: string;
};

export type ServerLoaderOutput = void | undefined | null | ServerLoadedData;

export type ServerLoader = (
  input: ServerLoaderInput,
) => ServerLoaderOutput | Promise<ServerLoaderOutput>;
