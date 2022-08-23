import type { ServerLoadedDataMap } from './nodes';

export type AppContextMap = Map<string, unknown>;

export type ServerContext = {
  modules: Set<string>;
  data: ServerLoadedDataMap;
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
  url: URL,
  context: { data: ServerContext['data'] },
) => Promise<ServerRenderResult>;
