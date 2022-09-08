import type { App } from '../App';
import type { PageFile } from '../files';
import { type FileRoute, FileRoutes } from './FileRoutes';

export type PageFileRoute = FileRoute<PageFile>;

export class PageFileRoutes extends FileRoutes<PageFile> {
  init(app: App): void {
    super.init(app);
    for (const page of app.files.pages) this.add(page);
    app.files.pages.onAdd((file) => this.add(file));
    app.files.pages.onRemove((file) => this.remove(file));
  }
}
