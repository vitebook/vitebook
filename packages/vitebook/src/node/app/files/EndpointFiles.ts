import { compareRoutes } from 'router';
import type { ServerEndpointFile } from 'server/types';

import { type App } from '../App';
import { Files, type FilesCallbacks } from './Files';

export class EndpointFiles extends Files<ServerEndpointFile> {
  init(app: App, options?: FilesCallbacks<ServerEndpointFile>) {
    return super.init(app, {
      include: app.config.routes.endpoints.include,
      exclude: app.config.routes.endpoints.exclude,
      ...options,
    });
  }

  async add(filePath: string) {
    const endpoint: ServerEndpointFile = {
      filePath,
      rootPath: this._getRootPath(filePath),
      route: this.resolveRoute(filePath),
    };

    this._files.push(endpoint);
    this._files = this._files.sort((a, b) => compareRoutes(a.route, b.route));
    this._options.onAdd?.(endpoint);

    return endpoint;
  }

  test(pathname: string) {
    for (let i = 0; i < this._files.length; i++) {
      if (this._files[i].route.pattern.test({ pathname })) {
        return true;
      }
    }

    return false;
  }
}
