import { comparePathDepth } from 'node/utils';
import { slash } from 'shared/utils/url';

import type { App } from '../App';
import {
  type SystemFileMeta,
  SystemFiles,
  type SystemFilesOptions,
} from './SystemFiles';

export type EndpointFile = SystemFileMeta & {
  readonly moduleId: string;
};

export class EndpointFiles extends SystemFiles<EndpointFile> {
  init(app: App, options?: Partial<SystemFilesOptions>) {
    return super.init(app, {
      include: app.config.routes.endpoints.include,
      exclude: app.config.routes.endpoints.exclude,
      ...options,
    });
  }

  async add(filePath: string) {
    const rootPath = this._getRootPath(filePath);

    const endpoint: EndpointFile = {
      moduleId: slash(rootPath),
      path: filePath,
      rootPath,
      ext: this._ext(filePath),
    };

    this._files.push(endpoint);
    this._files = this._files.sort((a, b) =>
      comparePathDepth(a.rootPath, b.rootPath),
    );
    this._callAddCallbacks(endpoint);

    return endpoint;
  }
}
