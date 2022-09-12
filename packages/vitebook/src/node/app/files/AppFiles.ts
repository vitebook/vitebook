import { type App } from '../App';
import { EndpointFiles } from './EndpointFiles';
import { ErrorFiles } from './ErrorFiles';
import { LayoutFiles } from './LayoutFiles';
import { MarkdocFiles } from './MarkdocFiles';
import { PageFiles } from './PageFiles';

export class AppFiles {
  pages = new PageFiles();
  errors = new ErrorFiles();
  layouts = new LayoutFiles();
  endpoints = new EndpointFiles();
  markdoc = new MarkdocFiles();

  async init(app: App) {
    await Promise.all([
      this.layouts.init(app),
      this.pages.init(app),
      this.errors.init(app),
      this.endpoints.init(app),
      this.markdoc.init(app),
    ]);

    for (const files of [this.pages, this.errors]) {
      for (const node of files) {
        node.layouts = this.layouts.getOwnedLayoutIndicies(node.path);
      }

      this.layouts.onAdd(() => {
        for (const node of files) {
          node.layouts = this.layouts.getOwnedLayoutIndicies(node.path);
        }
      });

      this.layouts.onRemove((_, index) => {
        for (const node of files) {
          if (node.layouts.includes(index)) {
            node.layouts = this.layouts.getOwnedLayoutIndicies(node.path);
          }
        }
      });

      files.onAdd((node) => {
        node.layouts = this.layouts.getOwnedLayoutIndicies(node.path);
      });
    }
  }

  clear() {
    this.pages.clear();
    this.errors.clear();
    this.layouts.clear();
    this.endpoints.clear();
    this.markdoc.clear();
  }
}
