import type { Route } from 'shared/routing';

import type { App } from '../App';
import type { EndpointFile } from '../files';
import { type SystemFileRoute, SystemFileRoutes } from './SystemFileRoutes';

export type EndpointFileRoute = SystemFileRoute<EndpointFile>;

export class EndpointFileRoutes extends SystemFileRoutes<EndpointFile> {
  protected _type: Route['type'] = 'endpoint';
  init(app: App): void {
    super.init(app);
    this._watch(app.files.endpoints);
  }
}
