import { compareRoutes } from 'router';
import type { ServerEndpoint } from 'server/types';

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
    this._nodes = this._nodes.sort((a, b) => compareRoutes(a.route, b.route));
    this._options.onAdd?.(endpoint);

    return endpoint;
  }

  test(pathname: string) {
    for (let i = 0; i < this._nodes.length; i++) {
      if (this._nodes[i].route.pattern.test({ pathname })) {
        return true;
      }
    }

    return false;
  }
}
