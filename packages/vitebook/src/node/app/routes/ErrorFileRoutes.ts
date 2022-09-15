import type { Route } from 'shared/routing';

import type { App } from '../App';
import type { ErrorFile } from '../files';
import { type SystemFileRoute, SystemFileRoutes } from './SystemFileRoutes';

export type ErrorFileRoute = SystemFileRoute<ErrorFile>;

export class ErrorFileRoutes extends SystemFileRoutes<ErrorFile> {
  protected _type: Route['type'] = 'error';
  init(app: App): void {
    super.init(app);
    this._watch(app.files.errors);
  }
}
