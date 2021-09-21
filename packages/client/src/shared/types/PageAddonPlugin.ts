import type { Plugin } from '@vitebook/core/node';

export type PageAddonPlugin = Plugin & {
  /**
   * Page addon module ID. Used client-side to dynamically load this page addon. The
   * module ID should resolve to a module that has a default `PageAddon` export.
   *
   * A module ID can be an absolute system file path, relative file path from `<root>`, or
   * virtual ID. This can be resolved/loaded in the `resolveId`/`load` plugin hooks.
   */
  addon: string;
};

export type PageAddonOption = PageAddonPlugin | false | null | undefined;
export type PageAddons = (PageAddonOption | PageAddonOption[])[];
