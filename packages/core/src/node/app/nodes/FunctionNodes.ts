import path from 'upath';

import { type ServerFunction } from '../../../shared';
import { type App } from '../App';
import { FileNodes, type FileNodesCallbacks } from './FileNodes';

export class FunctionNodes extends FileNodes<ServerFunction> {
  init(app: App, options?: FileNodesCallbacks<ServerFunction>) {
    return super.init(app, {
      include: app.config.routes.functions.include,
      exclude: app.config.routes.functions.exclude,
      ...options,
    });
  }

  async add(filePath: string) {
    const fn: ServerFunction = {
      filePath,
      rootPath: this._getRootPath(filePath),
      route: this.resolveRoute(filePath),
      edge: path.basename(filePath).includes('@edge'),
    };

    this._nodes.push(fn);
    this._options.onAdd?.(fn);

    return fn;
  }
}
