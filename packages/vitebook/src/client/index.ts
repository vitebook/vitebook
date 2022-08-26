import type { AppContextMap } from '../shared';
import type { Router } from './router/Router';
import type { ViewRenderer } from './view/ViewRenderer';

export * from '../shared/client';
export * from '../shared/markdown';
export * from '../shared/route';
export * from '../shared/server';
export * from '../shared/ssr';
// context
export * from './context';
// router
export * from './router/history/memory';
export * from './router/Router';
export * from './router/types';
// view
export * from './view/ViewRenderer';
// stores
export * from './stores/layouts';
export * from './stores/markdown';
export * from './stores/page';
export * from './stores/pages';
export * from './stores/route';
export * from './stores/store';
export * from './stores/types';

export type ConfigureApp = (app: {
  context: AppContextMap;
  router: Router;
  renderers: ViewRenderer[];
}) => void | Promise<void>;
