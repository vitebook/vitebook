import type { App } from '../App';
import type { EndpointFile } from '../files';
import { type FileRoute, FileRoutes } from './FileRoutes';

export type EndpointFileRoute = FileRoute<EndpointFile>;

export class EndpointFileRoutes extends FileRoutes<EndpointFile> {
  init(app: App): void {
    this._endpoints = true;
    super.init(app);
    for (const endpoint of app.files.endpoints) this.add(endpoint);
    app.files.endpoints.onAdd((file) => this.add(file));
    app.files.endpoints.onRemove((file) => this.remove(file));
  }
}
