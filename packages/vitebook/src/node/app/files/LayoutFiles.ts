import fs from 'node:fs';
import path from 'node:path';
import type { ServerLayoutFile } from 'server/types';
import { isString } from 'shared/utils/unit';

import { type App } from '../App';
import { type FilesCallbacks } from './Files';
import { LoadableFiles } from './LoadableFiles';

const STRIP_LAYOUTS_PATH = /\/@layouts\/.+/;
const LAYOUT_NAME_RE = /(.*?)@layout/;

export class LayoutFiles extends LoadableFiles<ServerLayoutFile> {
  init(app: App, options?: FilesCallbacks<ServerLayoutFile>) {
    return super.init(app, {
      include: app.config.routes.layouts.include,
      exclude: app.config.routes.layouts.exclude,
      ...options,
    });
  }

  async add(filePath: string) {
    filePath = this.normalizePath(filePath);

    const name = await this._getName(filePath);
    const rootPath = this._getRootPath(filePath);
    const owningDir = path.posix.dirname(
      rootPath.replace(STRIP_LAYOUTS_PATH, '/root.md'),
    );

    const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const hasStaticLoader = this.hasStaticLoader(fileContent);
    const hasServerLoader = this.hasServerLoader(fileContent);
    const hasServerAction = this.hasServerAction(fileContent);
    const reset = rootPath.includes(`.reset${path.posix.extname(rootPath)}`);

    const layout: ServerLayoutFile = {
      id: `/${rootPath}`,
      name,
      filePath,
      rootPath,
      owningDir,
      hasStaticLoader,
      hasServerLoader,
      hasServerAction,
      reset,
    };

    this._files.push(layout);
    this._files = this._files.sort((a, b) => {
      const segmentsA = a.rootPath.split(/\//g);
      const segmentsB = b.rootPath.split(/\//g);

      return segmentsA.length !== segmentsB.length
        ? segmentsA.length - segmentsB.length // shallow paths first
        : path.posix.basename(a.rootPath, path.posix.extname(a.rootPath)) ===
          '@layout'
        ? -1
        : 1;
    });

    this._options.onAdd?.(layout);

    return layout;
  }

  isOwnedBy(
    layout: string | ServerLayoutFile,
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

    for (let i = 0; i < this._files.length; i++) {
      const layout = this._files[i];
      if (this.isOwnedBy(layout.filePath, ownerFilePath, layoutName)) {
        if (layout.reset) indicies = [];
        indicies.push(i);
      }
    }

    return indicies;
  }

  protected _getName(filePath: string) {
    const filename = path.posix
      .basename(filePath, path.posix.extname(filePath))
      .replace(/\.reset($|\/)/, '');
    const match = filename.match(LAYOUT_NAME_RE)?.[1];
    return match && match.length > 0 ? match : filename;
  }
}
