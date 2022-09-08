import { comparePathDepth } from 'node/utils';
import { slash } from 'shared/utils/url';

import type { App } from '../App';
import {
  type SystemFileMeta,
  SystemFiles,
  type SystemFilesOptions,
} from './SystemFiles';

export type PageFile = SystemFileMeta & {
  readonly moduleId: string;
  layouts: number[];
};

export class PageFiles extends SystemFiles<PageFile> {
  init(app: App, options?: Partial<SystemFilesOptions>) {
    return super.init(app, {
      include: app.config.routes.pages.include,
      exclude: app.config.routes.pages.exclude,
      ...options,
    });
  }

  async add(filePath: string) {
    filePath = this._normalizePath(filePath);

    this.remove(filePath);

    const rootPath = this._getRootPath(filePath);
    const moduleId = slash(rootPath);
    const ext = this._ext(rootPath);

    const page: PageFile = {
      moduleId,
      path: filePath,
      rootPath,
      ext,
      layouts: [],
    };

    this._files.push(page);
    this._files = this._files.sort((a, b) =>
      comparePathDepth(a.rootPath, b.rootPath),
    );
    this._callAddCallbacks(page);

    return page;
  }
}
