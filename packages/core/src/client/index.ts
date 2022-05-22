import type { Router } from './router/Router';
import type { ViewRenderer } from './view/ViewRenderer';

export * from '../shared';
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
  context: Map<string, unknown>;
  router: Router;
  renderers: ViewRenderer[];
}) => void | Promise<void>;
