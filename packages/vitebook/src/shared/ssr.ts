import type { ServerLoadedDataMap } from './server';

export type ServerContext = {
  modules: Set<string>;
  data: ServerLoadedDataMap;
};

export type ServerEntryModule = {
  render: ServerRenderer;
};

export type ServerRenderResult = {
  head?: string;
  css?: string;
  html: string;
  context: ServerContext;
};

export type ServerRenderer = (
  url: URL,
  context: { data: ServerContext['data'] },
) => Promise<ServerRenderResult>;
