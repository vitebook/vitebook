import { createFilter } from '@rollup/pluginutils';
import fs from 'fs';
import { globbySync } from 'globby';
import path from 'upath';

import {
  compareRoutes,
  type PageRouteMatcherConfig,
  prettyJsonStr,
  type ServerLayout,
  type ServerPage,
  slash,
  stripImportQuotesFromJson,
} from '../../../../shared';
import { normalizePath } from '../../../utils';
import { getFrontmatter } from '../markdown';
import {
  getPageLayoutNameFromFilePath,
  getPageNameFromFilePath,
  resolvePageRouteFromFilePath,
} from './utils';

const MD_FILE_RE = /\.md($|\/)/;
const PAGE_LAYOUT_NAME_RE = /\+(.*?)\./;
const STRIP_LAYOUTS_PATH = /\/@layouts\/.+/;
const HAS_LOADER_RE = /(export function loader|export const loader)/;
const STRIP_URL_PATTERN_QUOTES_RE = /"new URLPattern(.*?)"/g;

export type PagesConfig = {
  include: string[];
  exclude: (string | RegExp)[];
  matchers: PageRouteMatcherConfig;

  dirs: {
    root: string;
    pages: string;
  };

  layouts: {
    include: string[];
    exclude: (string | RegExp)[];
  };
};

export class Pages {
  /* root filepath to page */
  protected _pages: ServerPage[] = [];

  /* root filepath to layout */
  protected _layouts: ServerLayout[] = [];

  protected _config!: PagesConfig;

  pagesFilter!: (id: string) => boolean;
  layoutsFilter!: (id: string) => boolean;

  get size() {
    return this._pages.length;
  }

  get all() {
    return this._pages;
  }

  get layouts() {
    return this._layouts;
  }

  async configure(config: PagesConfig) {
    this.layoutsFilter = createFilter(
      config.layouts.include,
      config.layouts.exclude,
    );
    this.pagesFilter = createFilter(config.include, config.exclude);
    this._config = config;
  }

  async discover() {
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
      (filePath.startsWith(this._config.dirs.pages) &&
        this.pagesFilter(filePath))
    );
  }

  isLayout(filePath: string) {
    return (
      this.hasLayout(filePath) ||
      (filePath.startsWith(this._config.dirs.pages) &&
        this.layoutsFilter(filePath))
    );
  }

  clear() {
    this._pages = [];
    this._layouts = [];
  }

  getPageFilePaths() {
    return globbySync(this._config.include, {
      absolute: true,
      cwd: this._config.dirs.pages,
    })
      .filter(this.pagesFilter)
      .map(normalizePath);
  }

  getLayoutFilePaths() {
    return globbySync(this._config.layouts.include, {
      absolute: true,
      cwd: this._config.dirs.pages,
    })
      .filter(this.layoutsFilter)
      .map(normalizePath);
  }

  getPage(filePath: string) {
    return this._pages.find((p) => p.filePath === filePath);
  }

  async addPage(filePath: string) {
    this.removePage(filePath);

    const rootPath = this.getRootPath(filePath);
    const name = getPageNameFromFilePath(filePath);
    const id = slash(rootPath);
    const ext = path.extname(rootPath);
    const route = this.resolvePageRoute(filePath);
    const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const layouts = this.resolveLayouts(filePath);
    const layoutName = this.getPageLayoutName(filePath, fileContent);
    const hasLoader = this.hasLoader(fileContent);

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

    this._pages.push(page);
    this._pages = this._pages.sort((a, b) => compareRoutes(a.route, b.route));

    return page;
  }

  hasLoader(fileContent: string) {
    return HAS_LOADER_RE.test(fileContent);
  }

  getPageIndex(filePath: string) {
    const page = this.getPage(filePath);
    return this._pages.findIndex((p) => p === page);
  }

  hasPage(filePath: string) {
    return !!this.getPage(filePath);
  }

  removePage(filePath: string) {
    if (!this.hasPage(filePath)) return;
    const index = this.getPageIndex(filePath);
    this._pages.splice(index, 1);
  }

  getLayout(filePath: string) {
    return this._layouts.find((l) => l.filePath === filePath);
  }

  getLayoutByIndex(index: number) {
    return this._layouts[index];
  }

  hasLayout(filePath: string) {
    return this._layouts.some((l) => l.filePath === filePath);
  }

  async addLayout(filePath: string) {
    const name = getPageLayoutNameFromFilePath(filePath);
    const rootPath = this.getRootPath(filePath);
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

    this._layouts.push(layout);

    this._layouts = this._layouts.sort((a, b) => {
      const segmentsA = a.rootPath.split(/\//g);
      const segmentsB = b.rootPath.split(/\//g);

      return segmentsA.length !== segmentsB.length
        ? segmentsA.length - segmentsB.length // shallow paths first
        : path.basename(a.rootPath, path.extname(a.rootPath)) === '@layout'
        ? -1
        : 1;
    });

    for (const page of this._pages) {
      page.layouts = this.resolveLayouts(page.filePath);
    }

    return layout;
  }

  removeLayout(filePath: string) {
    if (!this.hasLayout(filePath)) return;

    const index = this.getLayoutIndex(filePath);
    this._layouts.splice(index, 1);

    for (const page of this._pages) {
      if (page.layouts.includes(index)) {
        page.layouts = this.resolveLayouts(page.filePath);
      }
    }
  }

  resolveLayouts(pageFilePath: string) {
    let layouts: number[] = [];

    this._layouts.forEach((layout, i) => {
      if (this.layoutBelongsTo(pageFilePath, layout.filePath)) {
        if (layout.reset) {
          layouts = [];
        }

        layouts.push(i);
      }
    });

    return layouts;
  }

  getLayoutIndex(filePath: string) {
    return this._layouts.findIndex((l) => l.filePath === filePath);
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

  layoutBelongsTo(pageFilePath: string, layoutFilePath: string) {
    const pageLayoutName = this.getPageLayoutName(pageFilePath);
    const pageRootPath = this.getRootPath(pageFilePath);
    const layout = this.getLayout(layoutFilePath);
    return (
      layout &&
      pageRootPath.startsWith(layout.owningDir) &&
      (layout.name === '@layout' || layout.name === pageLayoutName)
    );
  }

  resolvePageRoute(pageFilePath: string) {
    return resolvePageRouteFromFilePath(
      this._config.dirs.pages,
      pageFilePath,
      this._config.matchers,
    );
  }

  loadPagesModule() {
    return `export default ${stripImportQuotesFromJson(
      prettyJsonStr(
        this._pages.map((page) => ({
          name: page.name,
          rootPath: page.rootPath,
          route: {
            ...page.route,
            // initialized late on client to allow polyfill to be installed.
            pattern: undefined,
          },
          ext: page.ext,
          layoutName: page.layoutName,
          layouts: page.layouts,
          context:
            Object.keys(page.context).length > 0 ? page.context : undefined,
          loader: `() => import('${page.id}')`,
        })),
      ),
    )}`.replace(STRIP_URL_PATTERN_QUOTES_RE, 'new URLPattern$1');
  }

  loadLayoutsModule() {
    return `export default ${stripImportQuotesFromJson(
      prettyJsonStr(
        this._layouts.map((layout) => {
          return {
            name: layout.name,
            rootPath: layout.rootPath,
            loader: `() => import('${layout.id}')`,
          };
        }),
      ),
    )}`;
  }

  protected getRootPath(filePath: string) {
    return path.relative(this._config.dirs.root, filePath);
  }

  protected getPagePath(filePath: string) {
    return path.relative(this._config.dirs.pages, filePath);
  }
}
