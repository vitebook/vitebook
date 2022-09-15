import type { App } from '../App';
import {
  type SystemFileMeta,
  SystemFiles,
  type SystemFilesOptions,
} from './SystemFiles';

export type ModuleFile = SystemFileMeta & {
  readonly moduleId: string;
};

export class ModuleFiles extends SystemFiles<ModuleFile> {
  add(filePath: string) {
    const file = this._createFile(filePath);
    this._add({
      ...file,
      moduleId: `/${file.rootPath}`,
    });
  }
}

export type EndpointFile = ModuleFile;

export class EndpointFiles extends ModuleFiles {
  init(app: App) {
    return super.init(app, {
      include: app.config.routes.endpoints.include,
      exclude: app.config.routes.endpoints.exclude,
    });
  }
}

export type LayoutFile = ModuleFile;

export class LayoutFiles extends ModuleFiles {
  init(app: App) {
    return super.init(app, {
      include: app.config.routes.layouts.include,
      exclude: app.config.routes.layouts.exclude,
    });
  }
}

export type LeafModuleFile = ModuleFile & {
  layouts: LayoutFile[];
};

export class LeafModuleFiles extends SystemFiles<LeafModuleFile> {
  async init(app: App, options: SystemFilesOptions) {
    await super.init(app, options);

    const addLayouts = (file: LeafModuleFile) => {
      file.layouts = app.files.layouts.getBranchFiles(file.path);
    };

    const updateLayouts = () => {
      for (const file of this._files) addLayouts(file);
    };

    app.files.layouts.onAdd(() => {
      updateLayouts();
    });

    app.files.layouts.onRemove((layout) => {
      for (const file of this._files) {
        if (file.layouts.includes(layout)) addLayouts(file);
      }
    });

    updateLayouts();
    this.onAdd(addLayouts);
  }

  add(filePath: string) {
    const file = this._createFile(filePath);
    this._add({
      ...file,
      moduleId: `/${file.rootPath}`,
      layouts: [],
    });
  }
}

export type ErrorFile = LeafModuleFile;

export class ErrorFiles extends LeafModuleFiles {
  init(app: App) {
    return super.init(app, {
      include: app.config.routes.errors.include,
      exclude: app.config.routes.errors.exclude,
    });
  }
}

export type PageFile = LeafModuleFile;

export class PageFiles extends LeafModuleFiles {
  init(app: App) {
    return super.init(app, {
      include: app.config.routes.pages.include,
      exclude: app.config.routes.pages.exclude,
    });
  }
}
