export * from './init';
export * from './router';
export * from './utils';
export type { JSONData } from 'server/http';
export type { ServerEntryContext, StaticLoaderDataMap } from 'server/types';
export * from 'shared/markdown';

export type AppConfig = {
  id: string;
  baseUrl: string;
  module: { [id: string]: unknown };
};
