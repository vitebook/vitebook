import { createFilter } from '@rollup/pluginutils';
import { globbySync } from 'globby';
import { normalizePath } from 'node/utils';
import type { ServerFile } from 'server/types';

import type { App } from '../App';
import { resolveRouteFromFilePath } from './resolve-file-route';

export type FilesOptions<T> = FilesCallbacks<T> & {
  include: string[];
  exclude?: (string | RegExp)[];
};

export type FilesCallbacks<T> = {
  onAdd?: (node: T) => void;
  onRemove?: (index: number) => void;
};

export abstract class Files<T extends ServerFile> implements Iterable<T> {
  protected _app!: App;
  protected _files: T[] = [];
  protected _options!: FilesOptions<T>;
  protected _filter!: (id: string) => boolean;

  get size() {
    return this._files.length;
  }

  async init(app: App, options: FilesOptions<T>) {
    this._app = app;
    this._options = options;
    this._filter = createFilter(options.include, options.exclude);
    await this._discover();
    app.disposal.add();
  }

  protected async _discover() {
    const filePaths = this._getFilePaths();
    await Promise.all(filePaths.map(this.add.bind(this)));
  }

  protected _getRootPath(filePath: string) {
    return this._app.dirs.root.relative(filePath);
  }

  protected _getFilePaths() {
    return globbySync(this._options.include, {
      absolute: true,
      cwd: this._app.dirs.app.path,
    })
      .map(normalizePath)
      .filter(this._filter);
  }

  abstract add(filePath: string): Promise<T>;

  remove(filePath: string) {
    filePath = this.normalizePath(filePath);
    if (!this.has(filePath)) return -1;
    const index = this.findIndex(filePath);
    this._files.splice(index, 1);
    this._options.onRemove?.(index);
    return index;
  }

  getByIndex(index: number) {
    return this._files[index];
  }

  find(filePath: string) {
    filePath = this.normalizePath(filePath);
    return this._files.find((node) => node.filePath === filePath);
  }

  findIndex(filePath: string) {
    const node = this.find(filePath);
    return this._files.findIndex((n) => n === node);
  }

  has(filePath: string) {
    return !!this.find(filePath);
  }

  clear() {
    this._files = [];
  }

  is(filePath: string) {
    filePath = this.normalizePath(filePath);
    return (
      this.has(filePath) ||
      (filePath.startsWith(this._app.dirs.app.path) && this._filter(filePath))
    );
  }

  normalizePath(filePath: string) {
    return normalizePath(filePath);
  }

  resolveRoute(filePath: string) {
    return resolveRouteFromFilePath(
      this._app.dirs.app.path,
      this.normalizePath(filePath),
      this._app.config.routes.matchers,
    );
  }

  toArray() {
    return this._files;
  }

  [Symbol.iterator]() {
    let index = 0;
    return {
      next: () => {
        if (index < this._files.length) {
          return { value: this._files[index++], done: false };
        } else {
          return { done: true };
        }
      },
    } as IterableIterator<T>;
  }
}
