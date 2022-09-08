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
}
