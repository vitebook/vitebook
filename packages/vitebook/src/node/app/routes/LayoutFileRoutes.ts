import type { Route } from 'shared/routing';

import type { App } from '../App';
import type { LayoutFile } from '../files';
import { type SystemFileRoute, SystemFileRoutes } from './SystemFileRoutes';

export type LayoutFileRoute = SystemFileRoute<LayoutFile>;

export class LayoutFileRoutes extends SystemFileRoutes<LayoutFile> {
  protected _type: Route['type'] = 'layout';
  init(app: App): void {
    super.init(app);
    this._watch(app.files.layouts);
  }
}
