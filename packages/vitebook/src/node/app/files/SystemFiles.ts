import { createFilter } from '@rollup/pluginutils';
import { globbySync } from 'globby';
import { normalizePath } from 'node/utils';
import path from 'path';

import type { App } from '../App';

export type SystemFileMeta = {
  /** Absolute system file path. */
  readonly path: string;
  /** System file path relative to app `<root>` dir. */
  readonly rootPath: string;
  /** File extension name (e.g., `.tsx`). */
  readonly ext: string;
};

export type SystemFilesOptions = {
  include: string[];
  exclude?: (string | RegExp)[];
};

export abstract class SystemFiles<T extends SystemFileMeta>
  implements Iterable<T>
{
  protected _app!: App;
  protected _files: T[] = [];
  protected _options!: SystemFilesOptions;
  protected _filter!: (id: string) => boolean;
  protected _onAdd = new Set<(file: T) => void>();
  protected _onRemove = new Set<(file: T, index: number) => void>();

  get size() {
    return this._files.length;
  }

  async init(app: App, options: SystemFilesOptions) {
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
    filePath = this._normalizePath(filePath);
    if (!this.has(filePath)) return -1;
    const index = this.findIndex(filePath);
    const file = this._files[index];
    this._files.splice(index, 1);
    for (const callback of this._onRemove) callback(file, index);
    return index;
  }

  getByIndex(index: number) {
    return this._files[index];
  }

  find(filePath: string) {
    filePath = this._normalizePath(filePath);
    return this._files.find((node) => node.path === filePath);
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
    filePath = this._normalizePath(filePath);
    return (
      this.has(filePath) ||
      (filePath.startsWith(this._app.dirs.app.path) && this._filter(filePath))
    );
  }

  onAdd(callback: (file: T) => void) {
    this._onAdd.add(callback);
  }

  onRemove(callback: (file: T, index: number) => void) {
    this._onRemove.add(callback);
  }

  toArray() {
    return this._files;
  }

  protected _ext(filePath: string) {
    return path.posix.extname(this._normalizePath(filePath));
  }

  protected _normalizePath(filePath: string) {
    return normalizePath(filePath);
  }

  protected _callAddCallbacks(file: T) {
    for (const callback of this._onAdd) callback(file);
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
