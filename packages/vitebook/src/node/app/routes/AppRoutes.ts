import type { App } from '../App';
import { EndpointFileRoutes } from './EndpointFileRoutes';
import { ErrorFileRoutes } from './ErrorFileRoutes';
import { PageFileRoutes } from './PageFileRoutes';

export class AppRoutes {
  pages = new PageFileRoutes();
  errors = new ErrorFileRoutes();
  endpoints = new EndpointFileRoutes();

  init(app: App) {
    this.pages.init(app);
    this.errors.init(app);
    this.endpoints.init(app);
  }
}
