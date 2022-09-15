import { type App } from '../App';
import { MarkdocFiles } from './MarkdocFiles';
import {
  EndpointFiles,
  ErrorFiles,
  LayoutFiles,
  PageFiles,
} from './ModuleFiles';

export class Files {
  pages = new PageFiles();
  errors = new ErrorFiles();
  layouts = new LayoutFiles();
  endpoints = new EndpointFiles();
  markdoc = new MarkdocFiles();

  protected _leafFiles = [this.pages, this.errors];

  async init(app: App) {
    await Promise.all([
      this.layouts.init(app),
      this.pages.init(app),
      this.errors.init(app),
      this.endpoints.init(app),
      this.markdoc.init(app),
    ]);
  }

  findLeaf(filePath: string) {
    for (const files of this._leafFiles) {
      const file = files.find(filePath);
      if (file) return file;
    }

    return undefined;
  }

  isLeaf(filePath: string) {
    return this._leafFiles.some((files) => files.is(filePath));
  }

  clear() {
    this.pages.clear();
    this.errors.clear();
    this.layouts.clear();
    this.endpoints.clear();
    this.markdoc.clear();
  }
}
