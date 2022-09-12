import path from 'node:path';

import type { App } from '../App';
import { type PageFile, PageFiles } from './PageFiles';
import { type SystemFilesOptions } from './SystemFiles';

export type ErrorFile = PageFile;

export class ErrorFiles extends PageFiles {
  init(app: App, options?: Partial<SystemFilesOptions>) {
    return super.init(app, {
      include: app.config.routes.errors.include,
      exclude: app.config.routes.errors.exclude,
      ...options,
    });
  }

  isOwnedBy(file: string, ownerFilePath: string) {
    const dirname = path.posix.dirname(this._getRootPath(file));
    return this._getRootPath(ownerFilePath).startsWith(dirname);
  }

  getOwnedLayoutIndicies(ownerFilePath: string) {
    const indicies: number[] = [];

    for (let i = 0; i < this._files.length; i++) {
      const file = this._files[i];
      if (this.isOwnedBy(file.path, ownerFilePath)) {
        indicies.push(i);
      }
    }

    return indicies;
  }
}
