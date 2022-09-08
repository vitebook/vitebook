import { compareRoutes, type Route } from 'shared/routing';

import type { App } from '../App';
import type { RouteMatcherConfig } from '../config';
import type { SystemFileMeta } from '../files';
import { resolveRouteFromFilePath } from './resolve-file-route';

export type FileRoute<T extends SystemFileMeta> = Route & {
  file: T;
};

export class FileRoutes<T extends SystemFileMeta>
  implements Iterable<FileRoute<T>>
{
  protected _routesDir!: string;
  protected _matchers!: RouteMatcherConfig;
  protected _routes: FileRoute<T>[] = [];
  protected _endpoints = false;

  get size() {
    return this._routes.length;
  }

  init(app: App) {
    this._routesDir = app.dirs.app.path;
    this._matchers = app.config.routes.matchers;
  }

  add(file: T) {
    const route: FileRoute<T> = {
      file,
      ...resolveRouteFromFilePath(
        this._routesDir,
        file.rootPath,
        this._matchers,
        this._endpoints,
      ),
    };

    this._routes.push(route);
    this._routes = this._routes.sort(compareRoutes);
  }

  remove(file: T) {
    const index = this._routes.findIndex((route) => route.file === file);
    if (index > -1) this._routes.splice(index, 1);
  }

  test(
    pathname: string,
    filter: (route: FileRoute<T>) => boolean = () => true,
  ) {
    for (let i = 0; i < this._routes.length; i++) {
      const route = this._routes[i];
      if (filter(route) && route.pattern.test({ pathname })) return true;
    }

    return false;
  }

  getByIndex(index: number) {
    return this._routes[index];
  }

  toArray() {
    return this._routes;
  }

  [Symbol.iterator]() {
    let index = 0;
    return {
      next: () => {
        if (index < this._routes.length) {
          return { value: this._routes[index++], done: false };
        } else {
          return { done: true };
        }
      },
    } as IterableIterator<FileRoute<T>>;
  }
}
