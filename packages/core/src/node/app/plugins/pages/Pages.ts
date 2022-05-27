import { createFilter } from '@rollup/pluginutils';
import fs from 'fs';
import { globbySync } from 'globby';
import path from 'upath';

import {
  calcRoutePathScore,
  compareRoutes,
  isFunction,
  isRoutePathDynamic,
  type PageRoute,
  type PageRouteMatcherConfig,
  prettyJsonStr,
  type ServerLayout,
  type ServerPage,
  slash,
  stripImportQuotesFromJson,
} from '../../../../shared';
import { getFrontmatter } from '../markdown';

const MD_FILE_RE = /\.md($|\/)/;
const ROUTE_MATCHERS_RE = /{(.*?)}/g;
const LAYOUT_NAME_RE = /(.*?)@layout/;
const PAGE_LAYOUT_NAME_RE = /@(.*?)\./;
const STRIP_LAYOUTS_PATH = /\/@layouts\/.+/;
const PAGE_ORDER_RE = /^\[(\d*)\]/;
const STRIP_PAGE_ORDER_RE = /^\[(\d*)\]/g;
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

  async init(config: PagesConfig) {
    config.exclude.push(/@layout\//, /@markdoc\//, /\/@/, /\/_/, /@server/);
    this.pagesFilter = createFilter(config.include, config.exclude);

    config.layouts.exclude.push(/\/_/, /@markdoc\//, /@server/);
    this.layoutsFilter = createFilter(
      config.layouts.include,
      config.layouts.exclude,
    );

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
    }).filter(this.pagesFilter);
  }

  getLayoutFilePaths() {
    return globbySync(this._config.include, {
      absolute: true,
      cwd: this._config.dirs.pages,
    }).filter(this.layoutsFilter);
  }

  getPage(filePath: string) {
    return this._pages.find((p) => p.filePath === filePath);
  }

  async addPage(filePath: string) {
    this.removePage(filePath);

    const rootPath = this.getRootPath(filePath);
    const id = slash(rootPath);
    const route = this.resolvePageRoute(filePath);
    const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const layouts = this.resolveLayouts(filePath);
    const layoutName = this.getPageLayoutName(filePath, fileContent);
    const hasLoader = this.hasLoader(fileContent);

    const page: ServerPage = {
      id,
      filePath,
      rootPath,
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
    const name = getPageLayoutNameFromPath(filePath);
    const rootPath = this.getRootPath(filePath);
    const owningDir = path.dirname(
      rootPath.replace(STRIP_LAYOUTS_PATH, '/root.md'),
    );

    const fileContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const hasLoader = HAS_LOADER_RE.test(fileContent);

    const layout: ServerLayout = {
      id: `/${rootPath}`,
      name,
      filePath,
      rootPath,
      owningDir,
      hasLoader,
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
    const layouts: number[] = [];

    this._layouts.forEach((layout, i) => {
      if (this.layoutBelongsTo(pageFilePath, layout.filePath)) {
        layouts.push(i);
      }
    });

    return layouts;
  }

  getLayoutIndex(filePath: string) {
    return this._layouts.findIndex((l) => l.filePath === filePath);
  }

  getPageLayoutName(pageFilePath: string, fileContent?: string) {
    const frontmatter = MD_FILE_RE.test(pageFilePath)
      ? getFrontmatter(
          fileContent ?? fs.readFileSync(pageFilePath, { encoding: 'utf-8' }),
        )
      : {};

    return (
      pageFilePath.match(PAGE_LAYOUT_NAME_RE)?.[1] ?? frontmatter.layout ?? ''
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
          route: {
            ...page.route,
            // initialized late on client to allow polyfill to be installed.
            pattern: undefined,
          },
          rootPath: page.rootPath,
          layoutName: page.layoutName,
          layouts: page.layouts,
          context: page.context,
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

export function getPageLayoutNameFromPath(filePath: string) {
  const filename = path.basename(filePath, path.extname(filePath));
  const match = filename.match(LAYOUT_NAME_RE)?.[1];
  return match && match.length > 0 ? match : filename;
}

export function stripPageOrderFromPath(filePath: string) {
  return filePath.replace(STRIP_PAGE_ORDER_RE, '');
}

export function stripRouteMatchersFromPath(filePath: string) {
  return filePath.replace(ROUTE_MATCHERS_RE, '');
}

export function stripPageLayoutNameFromPath(filePath: string) {
  const ext = path.extname(filePath);
  return filePath.replace(new RegExp(`@\\w+\\.${ext.slice(1)}$`, 'i'), ext);
}

export function stripPageInfoFromPath(filePath: string) {
  return stripRouteMatchersFromPath(
    stripPageLayoutNameFromPath(stripPageOrderFromPath(filePath)),
  );
}

export function resolvePageRouteFromFilePath(
  pagesDir: string,
  filePath: string,
  config: PageRouteMatcherConfig = {},
): PageRoute {
  const pagePath = path.relative(pagesDir, filePath);
  const orderMatch = path.basename(pagePath).match(PAGE_ORDER_RE)?.[1];
  const order = orderMatch ? Number(orderMatch) : undefined;

  let route = stripPageLayoutNameFromPath(stripPageOrderFromPath(pagePath));

  for (const match of pagePath.match(ROUTE_MATCHERS_RE) ?? []) {
    const matcherName = match.slice(1, -1); // slice off `{` and `}`
    const matcher = config[matcherName];

    let value = isFunction(matcher) ? matcher({ filePath, pagePath }) : matcher;

    if (value instanceof RegExp) {
      // slice off `/` from start and end.
      value = `(${value.toString().slice(1, -1)})`;
    }

    route = route.replace(`{${matcherName}}`, `${value ?? ''}`);
  }

  const isNotFound = route.startsWith('404');

  const resolveStaticPath = () => {
    if (isNotFound) return '(.*?)';

    const url = new URL(route.toLowerCase(), 'http://fake-host.com');
    return url.pathname
      .replace(/\..+($|\\?)/i, '.html')
      .replace(/\/(README|index).html($|\?)/i, '/');
  };

  const dynamic = isNotFound || isRoutePathDynamic(slash(route));

  const pathname =
    dynamic && !isNotFound ? slash(path.trimExt(route)) : resolveStaticPath();

  const score = calcRoutePathScore(pathname);
  const pattern = new URLPattern({ pathname });

  return {
    pattern,
    dynamic,
    pathname,
    order,
    score,
  };
}
