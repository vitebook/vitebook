import type { Route } from 'shared/routing';

import type { App } from '../App';
import type { PageFile } from '../files';
import { type SystemFileRoute, SystemFileRoutes } from './SystemFileRoutes';

export type PageFileRoute = SystemFileRoute<PageFile>;

export class PageFileRoutes extends SystemFileRoutes<PageFile> {
  protected _type: Route['type'] = 'page';
  init(app: App): void {
    super.init(app);
    this._watch(app.files.pages);
  }
}
