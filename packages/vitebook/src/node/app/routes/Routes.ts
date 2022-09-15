import type { App } from '../App';
import { EndpointFileRoutes } from './EndpointFileRoutes';
import { ErrorFileRoutes } from './ErrorFileRoutes';
import { LayoutFileRoutes } from './LayoutFileRoutes';
import { PageFileRoutes } from './PageFileRoutes';
import { SystemFileRoute } from './SystemFileRoutes';

export class Routes {
  layouts = new LayoutFileRoutes();
  errors = new ErrorFileRoutes();
  pages = new PageFileRoutes();
  endpoints = new EndpointFileRoutes();

  protected _client: SystemFileRoute[] = [];

  init(app: App) {
    this.pages.init(app);
    this.errors.init(app);
    this.layouts.init(app);
    this.endpoints.init(app);
    this._updateClient();
    [this.pages, this.errors, this.layouts].forEach((routes) => {
      routes.onAdd(() => this._updateClient());
      routes.onRemove(() => this._updateClient());
    });
  }

  get client() {
    return this._client;
  }

  protected _updateClient() {
    this._client = [
      // Order here is important because the reverse is the natural render order.
      ...this.pages.toArray(),
      ...this.errors.toArray(),
      ...this.layouts.toArray(),
    ].sort((a, b) => b.score - a.score);
  }
}
