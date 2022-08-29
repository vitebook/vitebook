import fs from 'node:fs';
import path from 'upath';

import { isString, type ServerLayout } from '../../../shared';
import { type App } from '../App';
import { FileNodes, type FileNodesCallbacks } from './FileNodes';

const STRIP_LAYOUTS_PATH = /\/@_nodes\/.+/;
const LAYOUT_NAME_RE = /(.*?)@layout/;

export class LayoutNodes extends FileNodes<ServerLayout> {
  init(app: App, options?: FileNodesCallbacks<ServerLayout>) {
    return super.init(app, {
      include: app.config.routes.layouts.include,
      exclude: app.config.routes.layouts.exclude,
      ...options,
    });
  }

  async add(filePath: string) {
    const name = await this._getName(filePath);
    const rootPath = this._getRootPath(filePath);
    const owningDir = path.dirname(
      rootPath.replace(STRIP_LAYOUTS_PATH, '/root.md'),
    );

    const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const hasLoader = this.hasLoader(fileContent);
    const reset = rootPath.includes(`.reset${path.extname(rootPath)}`);

    const layout: ServerLayout = {
      id: `/${rootPath}`,
      name,
      filePath,
      rootPath,
      owningDir,
      hasLoader,
      reset,
    };

    this._nodes.push(layout);
    this._nodes = this._nodes.sort((a, b) => {
      const segmentsA = a.rootPath.split(/\//g);
      const segmentsB = b.rootPath.split(/\//g);

      return segmentsA.length !== segmentsB.length
        ? segmentsA.length - segmentsB.length // shallow paths first
        : path.basename(a.rootPath, path.extname(a.rootPath)) === '@layout'
        ? -1
        : 1;
    });

    this._options.onAdd?.(layout);

    return layout;
  }

  isOwnedBy(
    layout: string | ServerLayout,
    ownerFilePath: string,
    layoutName?: string,
  ) {
    const rootPath = this._getRootPath(ownerFilePath);
    const _layout = isString(layout) ? this.find(layout) : layout;
    return (
      _layout &&
      rootPath.startsWith(_layout.owningDir) &&
      (_layout.name === '@layout' || _layout.name === layoutName)
    );
  }

  getOwnedLayoutIndicies(ownerFilePath: string, layoutName?: string) {
    let indicies: number[] = [];

    for (let i = 0; i < this._nodes.length; i++) {
      const layout = this._nodes[i];
      if (this.isOwnedBy(layout.filePath, ownerFilePath, layoutName)) {
        if (layout.reset) indicies = [];
        indicies.push(i);
      }
    }

    return indicies;
  }

  protected _getName(filePath: string) {
    const filename = path
      .basename(filePath, path.extname(filePath))
      .replace(/\.reset($|\/)/, '');
    const match = filename.match(LAYOUT_NAME_RE)?.[1];
    return match && match.length > 0 ? match : filename;
  }
}
