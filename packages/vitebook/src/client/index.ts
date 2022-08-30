import type { Router } from './router/Router';

export * from '../shared/client';
export * from '../shared/markdown';
export { installURLPattern } from '../shared/polyfills';
export * from '../shared/route';
export * from '../shared/server';
export * from '../shared/ssr';
export { isLoadedMarkdownPage, isLoadedPage } from '../shared/utils/page';
// router
export * from './init-router';
export * from './router/comparators/comparator';
export * from './router/comparators/types';
export * from './router/comparators/url-pattern-comparator';
export * from './router/create-router';
export * from './router/history/memory';
export * from './router/Router';
export * from './router/scroll-delegate';
export * from './router/types';
// reactivity
export * from './reactivity';

export type AppConfig = {
  id: string;
  module: { [id: string]: unknown };
  baseUrl: string;
  configs: ConfigureApp[];
};

export type ConfigureApp = (app: { router: Router }) => void | Promise<void>;
