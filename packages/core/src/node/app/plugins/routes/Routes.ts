import { createFilter } from '@rollup/pluginutils';
import fs from 'fs';
import { globbySync } from 'globby';
import path from 'upath';

import {
  compareRoutes,
  type ServerLayout,
  type ServerPage,
  slash,
} from '../../../../shared';
import { normalizePath } from '../../../utils';
import { type App } from '../../App';
import { getFrontmatter } from '../markdown';
import {
  getPageLayoutNameFromFilePath,
  getPageNameFromFilePath,
  resolveRouteFromFilePath,
} from './utils';

const MD_FILE_RE = /\.md($|\/)/;
const PAGE_LAYOUT_NAME_RE = /\+(.*?)\./;
const STRIP_LAYOUTS_PATH = /\/@layouts\/.+/;
const HAS_LOADER_RE = /(export function loader|export const loader)/;

export class Routes {
  protected _app!: App;

  pages: ServerPage[] = [];
  layouts: ServerLayout[] = [];

  protected _pagesFilter!: (id: string) => boolean;
  protected _layoutsFilter!: (id: string) => boolean;

  async init(app: App) {
    this._app = app;

    this._layoutsFilter = createFilter(
      app.config.routes.layouts.include,
      app.config.routes.layouts.exclude,
    );

    this._pagesFilter = createFilter(
      app.config.routes.pages.include,
      app.config.routes.pages.exclude,
    );

    await this.discoverLayouts();
    await this.discoverPages();
  }

  async discoverLayouts() {
    const filePaths = this.getLayoutFilePaths();
    await Promise.all(filePaths.map(this.addLayout.bind(this)));
  }

  async discoverPages() {
    const filePaths = this.getPageFilePaths();
    await Promise.all(filePaths.map(this.addPage.bind(this)));
  }

  isPage(filePath: string) {
    return (
      this.hasPage(filePath) ||
      (filePath.startsWith(this._app.dirs.app.path) &&
        this._pagesFilter(filePath))
    );
  }

  isLayout(filePath: string) {
    return (
      this.hasLayout(filePath) ||
      (filePath.startsWith(this._app.dirs.app.path) &&
        this._layoutsFilter(filePath))
    );
  }

  clear() {
    this.pages = [];
    this.layouts = [];
  }

  getPageFilePaths() {
    return globbySync(this._app.config.routes.pages.include, {
      absolute: true,
      cwd: this._app.dirs.app.path,
    })
      .filter(this._pagesFilter)
      .map(normalizePath);
  }

  getLayoutFilePaths() {
    return globbySync(this._app.config.routes.layouts.include, {
      absolute: true,
      cwd: this._app.dirs.app.path,
    })
      .filter(this._layoutsFilter)
      .map(normalizePath);
  }

  getPage(filePath: string) {
    return this.pages.find((p) => p.filePath === filePath);
  }

  async addPage(filePath: string) {
    this.removePage(filePath);

    const rootPath = this._app.dirs.root.relative(filePath);
    const name = getPageNameFromFilePath(filePath);
    const id = slash(rootPath);
    const ext = path.extname(rootPath);
    const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const layouts = this.resolvePageLayouts(filePath);
    const layoutName = this.getPageLayoutName(filePath, fileContent);
    const hasLoader = this.hasLoader(fileContent);
    const route = resolveRouteFromFilePath(
      this._app.dirs.app.path,
      filePath,
      this._app.config.routes.matchers,
    );

    const page: ServerPage = {
      id,
      name,
      filePath,
      rootPath,
      ext,
      route,
      layouts,
      layoutName,
      hasLoader,
      context: {},
    };

    this.pages.push(page);
    this.pages = this.pages.sort((a, b) => compareRoutes(a.route, b.route));

    return page;
  }

  hasLoader(fileContent: string) {
    return HAS_LOADER_RE.test(fileContent);
  }

  getPageIndex(filePath: string) {
    const page = this.getPage(filePath);
    return this.pages.findIndex((p) => p === page);
  }

  hasPage(filePath: string) {
    return !!this.getPage(filePath);
  }

  removePage(filePath: string) {
    if (!this.hasPage(filePath)) return;
    const index = this.getPageIndex(filePath);
    this.pages.splice(index, 1);
  }

  getLayout(filePath: string) {
    return this.layouts.find((l) => l.filePath === filePath);
  }

  getLayoutByIndex(index: number) {
    return this.layouts[index];
  }

  hasLayout(filePath: string) {
    return this.layouts.some((l) => l.filePath === filePath);
  }

  async addLayout(filePath: string) {
    const name = getPageLayoutNameFromFilePath(filePath);
    const rootPath = this._app.dirs.root.relative(filePath);
    const owningDir = path.dirname(
      rootPath.replace(STRIP_LAYOUTS_PATH, '/root.md'),
    );

    const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const hasLoader = HAS_LOADER_RE.test(fileContent);
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

    this.layouts.push(layout);

    this.layouts = this.layouts.sort((a, b) => {
      const segmentsA = a.rootPath.split(/\//g);
      const segmentsB = b.rootPath.split(/\//g);

      return segmentsA.length !== segmentsB.length
        ? segmentsA.length - segmentsB.length // shallow paths first
        : path.basename(a.rootPath, path.extname(a.rootPath)) === '@layout'
        ? -1
        : 1;
    });

    for (const page of this.pages) {
      page.layouts = this.resolvePageLayouts(page.filePath);
    }

    return layout;
  }

  removeLayout(filePath: string) {
    if (!this.hasLayout(filePath)) return;

    const index = this.getLayoutIndex(filePath);
    this.layouts.splice(index, 1);

    for (const page of this.pages) {
      if (page.layouts.includes(index)) {
        page.layouts = this.resolvePageLayouts(page.filePath);
      }
    }
  }

  resolvePageLayouts(pageFilePath: string) {
    let layouts: number[] = [];

    this.layouts.forEach((layout, i) => {
      if (this.doesLayoutBelongToPage(pageFilePath, layout.filePath)) {
        if (layout.reset) {
          layouts = [];
        }

        layouts.push(i);
      }
    });

    return layouts;
  }

  getLayoutIndex(filePath: string) {
    return this.layouts.findIndex((l) => l.filePath === filePath);
  }

  getPageLayoutName(
    pageFilePath: string,
    fileContent?: string,
  ): string | undefined {
    const frontmatter = MD_FILE_RE.test(pageFilePath)
      ? getFrontmatter(
          fileContent ?? fs.readFileSync(pageFilePath, { encoding: 'utf-8' }),
        )
      : {};

    return (
      pageFilePath.match(PAGE_LAYOUT_NAME_RE)?.[1] ??
      frontmatter.layout ??
      undefined
    );
  }

  doesLayoutBelongToPage(pageFilePath: string, layoutFilePath: string) {
    const pageLayoutName = this.getPageLayoutName(pageFilePath);
    const pageRootPath = this._app.dirs.root.relative(pageFilePath);
    const layout = this.getLayout(layoutFilePath);
    return (
      layout &&
      pageRootPath.startsWith(layout.owningDir) &&
      (layout.name === '@layout' || layout.name === pageLayoutName)
    );
  }
}
