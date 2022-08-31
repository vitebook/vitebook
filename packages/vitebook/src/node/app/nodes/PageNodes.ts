import fs from 'node:fs/promises';
import path from 'node:path';

import { compareRoutes, type ServerPage, slash } from '../../../shared';
import type { App } from '../App';
import { getFrontmatter } from '../markdoc';
import { FileNodes, type FileNodesCallbacks } from './FileNodes';

const MD_FILE_RE = /\.md($|\/)/;
const PAGE_LAYOUT_NAME_RE = /\+(.*?)\./;

export class PageNodes extends FileNodes<ServerPage> {
  init(app: App, options?: FileNodesCallbacks<ServerPage>) {
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
    const hasLoader = this.hasLoader(fileContent);
    const route = this.resolveRoute(filePath);

    const page: ServerPage = {
      id,
      filePath,
      rootPath,
      ext,
      route,
      layouts: [],
      layoutName,
      hasLoader,
      context: {},
    };

    this._nodes.push(page);
    this._nodes = this._nodes.sort((a, b) => compareRoutes(a.route, b.route));
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

  test(pathname: string) {
    for (let i = 0; i < this._nodes.length; i++) {
      const node = this._nodes[i];
      if (
        !node.rootPath.includes('@404') &&
        node.route.pattern.test({ pathname })
      ) {
        return true;
      }
    }

    return false;
  }
}
