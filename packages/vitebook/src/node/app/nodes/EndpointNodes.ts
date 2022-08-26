import { type ServerEndpoint } from '../../../shared';
import { type App } from '../App';
import { FileNodes, type FileNodesCallbacks } from './FileNodes';

export class EndpointNodes extends FileNodes<ServerEndpoint> {
  init(app: App, options?: FileNodesCallbacks<ServerEndpoint>) {
    return super.init(app, {
      include: app.config.routes.endpoints.include,
      exclude: app.config.routes.endpoints.exclude,
      ...options,
    });
  }

  async add(filePath: string) {
    const endpoint: ServerEndpoint = {
      filePath,
      rootPath: this._getRootPath(filePath),
      route: this.resolveRoute(filePath),
    };

    this._nodes.push(endpoint);
    this._options.onAdd?.(endpoint);

    return endpoint;
  }
}
