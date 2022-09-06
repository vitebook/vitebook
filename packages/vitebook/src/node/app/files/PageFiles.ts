import { getFrontmatter } from 'node/markdoc';
import fs from 'node:fs/promises';
import path from 'node:path';
import { compareRoutes } from 'router';
import type { ServerPageFile } from 'server/types';
import { slash } from 'shared/utils/url';

import type { App } from '../App';
import { type FilesCallbacks } from './Files';
import { LoadableFiles } from './LoadableFiles';

const MD_FILE_RE = /\.md($|\/)/;
const PAGE_LAYOUT_NAME_RE = /\+(.*?)\./;

export class PageFiles extends LoadableFiles<ServerPageFile> {
  init(app: App, options?: FilesCallbacks<ServerPageFile>) {
    return super.init(app, {
      include: app.config.routes.pages.include,
      exclude: app.config.routes.pages.exclude,
      ...options,
    });
  }

  async add(filePath: string) {
    filePath = this.normalizePath(filePath);

    this.remove(filePath);

    const rootPath = this._getRootPath(filePath);
    const id = slash(rootPath);
    const ext = path.posix.extname(rootPath);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const layoutName = await this.getLayoutName(filePath, fileContent);
    const is404 = id.includes('@404');
    const hasStaticLoader = this.hasStaticLoader(fileContent);
    const hasServerLoader = this.hasServerLoader(fileContent);
    const hasServerAction = this.hasServerAction(fileContent);
    const route = this.resolveRoute(filePath);

    const page: ServerPageFile = {
      id,
      filePath,
      rootPath,
      ext,
      route,
      layouts: [],
      layoutName,
      is404,
      hasStaticLoader,
      hasServerLoader,
      hasServerAction,
    };

    this._files.push(page);
    this._files = this._files.sort((a, b) => compareRoutes(a.route, b.route));
    this._options.onAdd?.(page);

    return page;
  }

  async getLayoutName(
    pageFilePath: string,
    fileContent?: string,
  ): Promise<string | undefined> {
    pageFilePath = this.normalizePath(pageFilePath);

    const frontmatter = MD_FILE_RE.test(pageFilePath)
      ? getFrontmatter(
          fileContent ?? (await fs.readFile(pageFilePath, 'utf-8')),
        )
      : {};

    return (
      pageFilePath.match(PAGE_LAYOUT_NAME_RE)?.[1] ??
      frontmatter.layout ??
      undefined
    );
  }

  test(
    pathname: string,
    filter: (page: ServerPageFile) => boolean = () => true,
  ) {
    for (let i = 0; i < this._files.length; i++) {
      const page = this._files[i];
      if (filter(page) && page.route.pattern.test({ pathname })) {
        return true;
      }
    }

    return false;
  }
}
