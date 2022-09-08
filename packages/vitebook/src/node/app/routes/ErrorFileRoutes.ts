import type { App } from '../App';
import type { ErrorFile } from '../files';
import { type FileRoute, FileRoutes } from './FileRoutes';

export type ErrorFileRoute = FileRoute<ErrorFile>;

export class ErrorFileRoutes extends FileRoutes<ErrorFile> {
  init(app: App): void {
    super.init(app);
    for (const error of app.files.errors) this.add(error);
    app.files.errors.onAdd((file) => this.add(file));
    app.files.errors.onRemove((file) => this.remove(file));
  }
}
