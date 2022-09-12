import type { App } from '../App';
import type { EndpointFile } from '../files';
import { type FileRoute, FileRoutes } from './FileRoutes';

export type EndpointFileRoute = FileRoute<EndpointFile>;

export class EndpointFileRoutes extends FileRoutes<EndpointFile> {
  protected _endpoints = true;

  init(app: App): void {
    super.init(app);
    for (const endpoint of app.files.endpoints) this.add(endpoint);
    app.files.endpoints.onAdd((file) => this.add(file));
    app.files.endpoints.onRemove((file) => this.remove(file));
  }
}
