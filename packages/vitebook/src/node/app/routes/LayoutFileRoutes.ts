import type { App } from '../App';
import type { LayoutFile } from '../files';
import { type FileRoute, FileRoutes } from './FileRoutes';

export type LayoutFileRoute = FileRoute<LayoutFile>;

export class LayoutFileRoutes extends FileRoutes<LayoutFile> {
  protected _layouts = true;

  init(app: App): void {
    super.init(app);
    for (const layout of app.files.layouts) this.add(layout);
    app.files.layouts.onAdd((file) => this.add(file));
    app.files.layouts.onRemove((file) => this.remove(file));
  }
}
