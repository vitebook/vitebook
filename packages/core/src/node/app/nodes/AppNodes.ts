import { type App } from '../App';
import { FunctionNodes } from './FunctionNodes';
import { LayoutNodes } from './LayoutNodes';
import { MarkdocNodes } from './MarkdocNodes';
import { PageNodes } from './PageNodes';

export class AppNodes {
  pages = new PageNodes();
  layouts = new LayoutNodes();
  functions = new FunctionNodes();
  markdoc = new MarkdocNodes();

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
      this.functions.init(app),
    ]);
  }

  clear() {
    this.pages.clear();
    this.layouts.clear();
    this.functions.clear();
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
