import type { App } from '../App';
import { EndpointFileRoutes } from './EndpointFileRoutes';
import { ErrorFileRoutes } from './ErrorFileRoutes';
import { LayoutFileRoutes } from './LayoutFileRoutes';
import { PageFileRoutes } from './PageFileRoutes';

export class AppRoutes {
  layouts = new LayoutFileRoutes();
  errors = new ErrorFileRoutes();
  pages = new PageFileRoutes();
  endpoints = new EndpointFileRoutes();

  init(app: App) {
    this.layouts.init(app);
    this.errors.init(app);
    this.pages.init(app);
    this.endpoints.init(app);
  }

  get all() {
    return [
      ...this.layouts.toArray(),
      ...this.errors.toArray(),
      ...this.pages.toArray(),
    ].sort((a, b) => b.score - a.score);
  }
}
