import type { HeadConfig } from './types/HeadConfig';
import type { ServerPage } from './types/Page';

export type VitebookSSRContext = {
  lang: string;
  head: HeadConfig[];
  modules: Set<string>;
};

export type ServerEntryModule = {
  render: ServerRenderFn;
};

export type ServerRenderResult = {
  context: VitebookSSRContext;
  head: string;
  css: string;
  html: string;
};

export type ServerRenderFn = (page: ServerPage) => Promise<ServerRenderResult>;
