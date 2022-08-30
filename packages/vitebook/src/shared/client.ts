import type { MarkdownMeta } from './markdown';
import type { Route } from './route';
import type { ServerLoader } from './server';

export type ClientPage = {
  /** System file path relative to `<root>`. */
  readonly rootPath: string;
  /** Page route object. */
  readonly route: Route;
  /** Page file extension.  */
  readonly ext: string;
  /** Additional page metadata. */
  readonly context?: Record<string, unknown>;
  /** Page layout name. */
  readonly layoutName?: string;
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
