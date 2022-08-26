import { createFilter } from '@rollup/pluginutils';
import { globbySync } from 'globby';

import { type ServerFile } from '../../../shared';
import { normalizePath } from '../../utils';
import type { App } from '../App';
import { resolveRouteFromFilePath } from './resolve-route';

const HAS_LOADER_RE =
  /(export function loader|export async function loader|export const loader)/;

export type FileNodesOptions<T> = FileNodesCallbacks<T> & {
  include: string[];
  exclude?: (string | RegExp)[];
};

export type FileNodesCallbacks<T> = {
  onAdd?: (node: T) => void;
  onRemove?: (index: number) => void;
};

export abstract class FileNodes<T extends ServerFile> implements Iterable<T> {
  protected _app!: App;
  protected _nodes: T[] = [];
  protected _options!: FileNodesOptions<T>;
  protected _filter!: (id: string) => boolean;

  get size() {
    return this._nodes.length;
  }

  async init(app: App, options: FileNodesOptions<T>) {
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
      .filter(this._filter)
      .map(normalizePath);
  }

  abstract add(filePath: string): Promise<T>;

  remove(filePath: string) {
    if (!this.has(filePath)) return -1;
    const index = this.findIndex(filePath);
    this._nodes.splice(index, 1);
    this._options.onRemove?.(index);
    return index;
  }

  getByIndex(index: number) {
    return this._nodes[index];
  }

  find(filePath: string) {
    return this._nodes.find((node) => node.filePath === filePath);
  }

  findIndex(filePath: string) {
    const node = this.find(filePath);
    return this._nodes.findIndex((n) => n === node);
  }

  has(filePath: string) {
    return !!this.find(filePath);
  }

  clear() {
    this._nodes = [];
  }

  is(filePath: string) {
    return (
      this.has(filePath) ||
      (filePath.startsWith(this._app.dirs.app.path) && this._filter(filePath))
    );
  }

  hasLoader(fileContent: string) {
    return HAS_LOADER_RE.test(fileContent);
  }

  resolveRoute(filePath: string) {
    return resolveRouteFromFilePath(
      this._app.dirs.app.path,
      filePath,
      this._app.config.routes.matchers,
    );
  }

  toArray() {
    return this._nodes;
  }

  [Symbol.iterator]() {
    let index = 0;
    return {
      next: () => {
        if (index < this._nodes.length) {
          return { value: this._nodes[index++], done: false };
        } else {
          return { done: true };
        }
      },
    } as IterableIterator<T>;
  }
}
