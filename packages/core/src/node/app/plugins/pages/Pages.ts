import { createFilter } from '@rollup/pluginutils';
import fs from 'fs';
import { globbySync } from 'globby';
import path from 'upath';

import {
  prettyJsonStr,
  type ServerLayout,
  type ServerPage,
  slash,
  stripImportQuotesFromJson,
} from '../../../../shared';
import { getFrontmatter } from '../markdown';
import { sortPaths } from './sortPaths';

const MD_FILE_RE = /\.md($|\/)/;
const LAYOUT_NAME_RE = /(.*?)@layout/;
const PAGE_LAYOUT_NAME_RE = /@(.*?)\./;
const STRIP_LAYOUTS_PATH = /\/@layouts\/.+/;
const HAS_LOADER_RE = /(export function loader|export const loader)/;

export type PagesConfig = {
  include: string[];
  exclude: (string | RegExp)[];

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
  protected readonly map = new Map<string, ServerPage>();

  /* root filepath to layout */
  protected readonly layouts = new Map<string, ServerLayout>();

  protected sortedLayoutPaths: string[] = [];

  protected config!: PagesConfig;

  pagesFilter!: (id: string) => boolean;
  layoutsFilter!: (id: string) => boolean;

  get size() {
    return this.map.size;
  }

  async init(config: PagesConfig) {
    config.exclude.push(/@layout\//, /@markdoc\//, /\/@/, /\/_/, /@server/);
    this.pagesFilter = createFilter(config.include, config.exclude);

    config.layouts.exclude.push(/\/_/, /@markdoc\//, /@server/);
    this.layoutsFilter = createFilter(
      config.layouts.include,
      config.layouts.exclude,
    );

    this.config = config;
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
    const rootPath = this.getRootPath(filePath);
    return (
      this.map.has(rootPath) ||
      (filePath.startsWith(this.config.dirs.pages) &&
        this.pagesFilter(filePath))
    );
  }

  isLayout(filePath: string) {
    const rootPath = this.getRootPath(filePath);
    return (
      this.layouts.has(rootPath) ||
      (filePath.startsWith(this.config.dirs.pages) &&
        this.layoutsFilter(filePath))
    );
  }

  clear() {
    this.map.clear();
    this.layouts.clear();
  }

  getPageFilePaths() {
    return globbySync(this.config.include, {
      absolute: true,
      cwd: this.config.dirs.pages,
    }).filter(this.pagesFilter);
  }

  getLayoutFilePaths() {
    return globbySync(this.config.include, {
      absolute: true,
      cwd: this.config.dirs.pages,
    }).filter(this.layoutsFilter);
  }

  getPage(filePath: string) {
    const rootPath = this.getRootPath(filePath);
    return this.map.get(rootPath);
  }

  getPages() {
    return Array.from(this.map.values());
  }

  async addPage(filePath: string) {
    const rootPath = this.getRootPath(filePath);
    const id = slash(rootPath);
    const route = this.resolveRoutePath(filePath);

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

    this.map.set(rootPath, page);
    return page;
  }

  hasLoader(fileContent: string) {
    return HAS_LOADER_RE.test(fileContent);
  }

  removePage(filePath: string) {
    const rootPath = this.getRootPath(filePath);
    this.map.delete(rootPath);
  }

  getLayout(filePath: string) {
    const rootPath = this.getRootPath(filePath);
    return this.layouts.get(rootPath);
  }

  getLayoutByIndex(index: number) {
    return this.layouts.get(this.sortedLayoutPaths[index]);
  }

  getLayouts() {
    return Array.from(this.layouts.values());
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

    this.layouts.set(rootPath, layout);

    if (!this.sortedLayoutPaths.includes(rootPath)) {
      this.sortedLayoutPaths.push(rootPath);
      this.sortedLayoutPaths = sortPaths(this.sortedLayoutPaths);
    }

    for (const page of this.map.values()) {
      page.layouts = this.resolveLayouts(page.filePath);
    }

    return layout;
  }

  removeLayout(filePath: string) {
    const rootPath = this.getRootPath(filePath);

    if (!this.layouts.has(rootPath)) return;

    this.layouts.delete(rootPath);

    const layoutIndex = this.getLayoutIndex(filePath);
    this.sortedLayoutPaths.splice(layoutIndex, 1);

    for (const page of this.map.values()) {
      if (page.layouts.includes(layoutIndex)) {
        page.layouts = this.resolveLayouts(page.filePath);
      }
    }
  }

  resolveLayouts(pageFilePath: string) {
    const layouts: number[] = [];

    this.sortedLayoutPaths.forEach((layoutRootPath, i) => {
      if (this.layoutBelongsTo(pageFilePath, layoutRootPath)) {
        layouts.push(i);
      }
    });

    return layouts;
  }

  getLayoutIndex(filePath: string) {
    const rootPath = this.getRootPath(filePath);
    return this.sortedLayoutPaths.findIndex((f) => f === rootPath);
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
    const layoutRootPath = this.getRootPath(layoutFilePath);
    const layout = this.layouts.get(layoutRootPath);
    return (
      layout &&
      pageRootPath.startsWith(layout.owningDir) &&
      (layout.name === '@layout' || layout.name === pageLayoutName)
    );
  }

  resolveRoutePath(pageFilePath: string) {
    return resolveRoute(this.config.dirs.pages, pageFilePath);
  }

  loadPagesModule() {
    return `export default ${stripImportQuotesFromJson(
      prettyJsonStr(
        Array.from(this.map.values()).map((page) => ({
          route: page.route,
          rootPath: page.rootPath,
          layoutName: page.layoutName,
          layouts: page.layouts,
          context: page.context,
          loader: `() => import('${page.id}')`,
        })),
      ),
    )}`;
  }

  loadLayoutsModule() {
    return `export default ${stripImportQuotesFromJson(
      prettyJsonStr(
        this.sortedLayoutPaths.map((rootPath) => {
          const layout = this.layouts.get(rootPath)!;
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
    return path.relative(this.config.dirs.root, filePath);
  }

  protected getPagesPath(filePath: string) {
    return path.relative(this.config.dirs.pages, filePath);
  }
}

export function stripPageOrderFromPath(filePath: string) {
  return filePath.replace(/\[\d*\]/g, '');
}

export function getPageLayoutNameFromPath(filePath: string) {
  const filename = path.basename(filePath, path.extname(filePath));
  const match = filename.match(LAYOUT_NAME_RE)?.[1];
  return match && match.length > 0 ? match : filename;
}

export function stripPageLayoutNameFromPath(filePath: string) {
  return filePath.replace(/@.+/, path.extname(filePath));
}

export function stripPageInfoFromPath(filePath: string) {
  return stripPageLayoutNameFromPath(stripPageOrderFromPath(filePath));
}

export function resolveRoute(pagesDir: string, filePath: string) {
  const pagesPath = path.relative(pagesDir, filePath);
  const route = stripPageInfoFromPath(pagesPath);
  const url = new URL(route.toLowerCase(), 'http://fake-host.com');
  return url.pathname
    .replace(/\..+($|\\?)/i, '.html')
    .replace(/\/(README|index).html($|\?)/i, '/');
}
