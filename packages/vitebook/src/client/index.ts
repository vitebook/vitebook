import type { Router } from 'router';

export * from './init-router';
export * from './types';
export { isLoadedMarkdownPage, isLoadedPage } from './utils';
export * from 'router';
export type {
  JSONData,
  ServerEntryContext,
  StaticLoaderDataMap,
} from 'server/types';
export * from 'shared/markdown';
export { installURLPattern } from 'shared/polyfills';

export type AppConfig = {
  id: string;
  module: { [id: string]: unknown };
  baseUrl: string;
  configs: ConfigureApp[];
};

export type ConfigureApp = (app: { router: Router }) => void | Promise<void>;
