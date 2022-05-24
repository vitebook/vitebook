import type { ServerPage } from './Page';

export type AppContextMap = Map<string, unknown>;

export type ServerContext = {
  modules: Set<string>;
  data: Map<string, Record<string, unknown>>;
};

export type ServerEntryModule = {
  render: ServerRenderer;
};

export type ServerRenderResult = {
  ssr: ServerContext;
  head?: string;
  css?: string;
  html: string;
};

export type ServerRenderer = (
  page: ServerPage,
  context: { data: ServerContext['data'] },
) => Promise<ServerRenderResult>;
