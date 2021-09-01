import type { Plugin as VitePlugin } from 'vite';

import type { App } from '../App.js';
import type { ServerPage } from '../site/Page.js';
import type { SiteOptions } from '../site/SiteOptions.js';

export type Plugin = VitePlugin & {
  /**
   * Configure the Vitebook nodejs application. This can also be used to store a reference to the
   * app for use in other hooks. Use the `context` property to store global data.
   */
  configureApp?: (app: App) => void | Promise<void>;

  /**
   * Modify site data before it's resolved. This hook can either mutate the passed-in object
   * directly, or return a partial object which will be deeply merged into existing data.
   *
   * This can also be used to update theme data (`site.options.theme`).
   */
  siteData?: <T extends SiteOptions>(
    options: T
  ) => T | null | void | Promise<T | null | void>;

  /**
   * Use this hook to read and store the final resolved site data.
   */
  siteDataResolved?: <T extends SiteOptions>(options: T) => Promise<void>;

  /**
   * Server-side Vitebook will resolve the `pages` glob array the user has provided which will
   * return a list of file paths that are possible pages. The file paths will be resolved to a page
   * via this hook.
   *
   * Similar to the Rollup `resolve` hook, this hook will be run sequentially until a plugin
   * successfully resolves a page. If no plugin is found a warning will be logged to the user, and
   * the file will not be included in the resovled pages set.
   */
  resolvePage(id: string, ssr?: boolean): ServerPage | null | void;
};

export type PluginOption = Plugin | false | null | undefined;

export type Plugins = (PluginOption | PluginOption[])[];
