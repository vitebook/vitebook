import { comparePathDepth } from 'node/utils';
import path from 'node:path';
import { isString } from 'shared/utils/unit';
import { slash } from 'shared/utils/url';

import type { App } from '../App';
import {
  type SystemFileMeta,
  SystemFiles,
  type SystemFilesOptions,
} from './SystemFiles';

export type LayoutFile = SystemFileMeta & {
  readonly moduleId: string;
  readonly owningDir: string;
  readonly reset: boolean;
};

export class LayoutFiles extends SystemFiles<LayoutFile> {
  init(app: App, options?: Partial<SystemFilesOptions>) {
    return super.init(app, {
      include: app.config.routes.layouts.include,
      exclude: app.config.routes.layouts.exclude,
      ...options,
    });
  }

  async add(filePath: string) {
    filePath = this._normalizePath(filePath);

    const rootPath = this._getRootPath(filePath);
    const ext = this._ext(rootPath);
    const owningDir = path.posix.dirname(rootPath);
    const reset = path.posix.basename(rootPath).includes('.reset.');

    const layout: LayoutFile = {
      moduleId: slash(rootPath),
      path: filePath,
      rootPath,
      ext,
      owningDir,
      reset,
    };

    this._files.push(layout);
    this._files = this._files.sort((a, b) =>
      comparePathDepth(a.rootPath, b.rootPath),
    );
    this._callAddCallbacks(layout);

    return layout;
  }

  isOwnedBy(layout: string | LayoutFile, ownerFilePath: string) {
    const rootPath = this._getRootPath(ownerFilePath);
    const _layout = isString(layout) ? this.find(layout) : layout;
    return _layout && rootPath.startsWith(_layout.owningDir);
  }

  getOwnedLayoutIndicies(ownerFilePath: string) {
    let indicies: number[] = [];

    for (let i = 0; i < this._files.length; i++) {
      const layout = this._files[i];
      if (this.isOwnedBy(layout.path, ownerFilePath)) {
        if (layout.reset) indicies = [];
        indicies.push(i);
      }
    }

    return indicies;
  }
}
