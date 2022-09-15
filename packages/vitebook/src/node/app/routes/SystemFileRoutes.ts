import { compareRoutes, type Route } from 'shared/routing';

import type { App } from '../App';
import type { RouteMatcherConfig } from '../config';
import type { SystemFileMeta, SystemFiles } from '../files';
import { resolveRouteFromFilePath } from './resolve-file-route';

export type SystemFileRoute<T extends SystemFileMeta = SystemFileMeta> =
  Route & { file: T };

export class SystemFileRoutes<T extends SystemFileMeta>
  implements Iterable<SystemFileRoute<T>>
{
  protected _type: Route['type'] = 'page';
  protected _routesDir!: string;
  protected _matchers!: RouteMatcherConfig;
  protected _routes: SystemFileRoute<T>[] = [];

  protected _onAdd = new Set<(route: SystemFileRoute<T>) => void>();
  protected _onRemove = new Set<
    (route: SystemFileRoute<T>, index: number) => void
  >();

  get size() {
    return this._routes.length;
  }

  init(app: App) {
    this._routesDir = app.dirs.app.path;
    this._matchers = app.config.routes.matchers;
  }

  add(file: T) {
    const route: SystemFileRoute<T> = {
      file,
      ...resolveRouteFromFilePath(
        this._type,
        this._routesDir,
        file.rootPath,
        this._matchers,
      ),
    };

    this._routes.push(route);
    this._routes = this._routes.sort(compareRoutes);
    for (const callback of this._onAdd) callback(route);
  }

  remove(file: T) {
    const index = this._routes.findIndex((route) => route.file === file);
    if (index > -1) {
      const route = this._routes[index];
      this._routes.splice(index, 1);
      for (const callback of this._onRemove) callback(route, index);
    }
  }

  test(
    pathname: string,
    filter: (route: SystemFileRoute<T>) => boolean = () => true,
  ) {
    for (let i = 0; i < this._routes.length; i++) {
      const route = this._routes[i];
      if (filter(route) && route.pattern.test({ pathname })) return true;
    }

    return false;
  }

  getByFile(file: T) {
    return this._routes.find((route) => route.file === file)!;
  }

  getByIndex(index: number) {
    return this._routes[index];
  }

  onAdd(callback: (route: SystemFileRoute<T>) => void) {
    this._onAdd.add(callback);
  }

  onRemove(callback: (route: SystemFileRoute<T>, index: number) => void) {
    this._onRemove.add(callback);
  }

  toArray() {
    return this._routes;
  }

  protected _watch(files: SystemFiles<T>) {
    for (const file of files) this.add(file);
    files.onAdd((file) => this.add(file));
    files.onRemove((file) => this.remove(file));
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
    } as IterableIterator<SystemFileRoute<T>>;
  }
}
