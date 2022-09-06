import { type App } from '../App';
import { EndpointFiles } from './EndpointFiles';
import { LayoutFiles } from './LayoutFiles';
import { MarkdocFiles } from './MarkdocFiles';
import { PageFiles } from './PageFiles';

export class AppFiles {
  pages = new PageFiles();
  layouts = new LayoutFiles();
  endpoints = new EndpointFiles();
  markdoc = new MarkdocFiles();

  async init(app: App) {
    await this.layouts.init(app, {
      onAdd: () => {
        this._resolvePageLayouts();
      },
      onRemove: (index) => {
        for (const page of this.pages) {
          if (page.layouts.includes(index)) {
            page.layouts = this.layouts.getOwnedLayoutIndicies(
              page.filePath,
              page.layoutName,
            );
          }
        }
      },
    });

    await Promise.all([
      this.pages.init(app, {
        onAdd: (page) => {
          page.layouts = this.layouts.getOwnedLayoutIndicies(
            page.filePath,
            page.layoutName,
          );
        },
      }),
      this.markdoc.init(app),
      this.endpoints.init(app),
    ]);
  }

  clear() {
    this.pages.clear();
    this.layouts.clear();
    this.endpoints.clear();
  }

  protected _resolvePageLayouts() {
    if (!this.pages.size) return;
    for (const page of this.pages) {
      page.layouts = this.layouts.getOwnedLayoutIndicies(
        page.filePath,
        page.layoutName,
      );
    }
  }
}
