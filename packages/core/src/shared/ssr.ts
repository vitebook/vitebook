import type { ServerPage } from './types/Page';

export type VitebookSSRContext = {
  modules: Set<string>;
};

export type ServerEntryModule = {
  render: ServerRenderFn;
};

export type ServerRenderResult = {
  ssr: VitebookSSRContext;
  head: string;
  css: string;
  html: string;
};

export type ServerRenderFn = (page: ServerPage) => Promise<ServerRenderResult>;
