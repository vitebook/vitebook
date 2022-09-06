import type { Route } from 'router/types';
import type { JSONData } from 'server/types';
import type { MarkdownMeta } from 'shared/markdown';

export type ClientPage = {
  /** System file path relative to `<root>`. */
  readonly rootPath: string;
  /** Page route object. */
  readonly route: Route;
  /** Page file extension.  */
  readonly ext: string;
  /** Page layout name. */
  readonly layoutName?: string;
  /** Page layouts identifiers. */
  readonly layouts: number[];
  /** Page module loader. Used to dynamically import page module client-side. */
  readonly loader: () => Promise<ClientPageModule>;
};

export type ClientPageModule = {
  readonly [id: string]: unknown;
  readonly default: unknown;
  readonly meta?: MarkdownMeta;
};

export type LoadedClientPage = Omit<ClientPage, 'layouts'> & {
  readonly $$loaded: true;
  readonly module: ClientPageModule;
  readonly default: unknown;
  readonly layouts: LoadedClientLayout[];
  readonly staticData: JSONData;
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
  readonly staticData: JSONData;
};

export {};
