import type { Plugin as VitePlugin } from 'vite';

import type { App, AppEnv } from '../App.js';
import type { ServerPage } from '../site/Page.js';
import type { SiteOptions } from '../site/SiteOptions.js';

export type Plugin = VitePlugin & {
  /**
   * Configure the Vitebook application. This can also be used to store a reference to the
   * app for use in other hooks. Use the `context` property to store global data.
   *
   * This hook is called after the application has initialized (all options have been resolved),
   * but in parallel with the `siteData` hook.
   */
  configureApp?: (app: App, env: AppEnv) => void | Promise<void>;

  /**
   * Modify site data before it's resolved. This hook can either mutate the passed-in object
   * directly, or return a partial object which will be deeply merged into existing data.
   *
   * This can also be used to update theme data (`site.options.theme`).
   *
   * This hook may be called more than once if the user changes the config file.
   */
  siteData?: <T extends SiteOptions>(
    options: T,
    env: AppEnv
  ) => Partial<T> | null | void | Promise<Partial<T> | null | void>;

  /**
   * Use this hook to read and store the final resolved site data.
   *
   * This hook may be called more than once if the user changes the config file.
   */
  siteDataResolved?: <T extends SiteOptions>(options: T) => Promise<void>;

  /**
   * Server-side Vitebook will resolve the `pages` glob array the user has provided which will
   * return a list of file paths that are possible pages. The file paths will be resolved to a page
   * via this hook.
   *
   * Similar to the Rollup `resolve` hook, this hook will be run sequentially on each plugin until
   * one successfully resolves a page. If no plugin resolves the path to a page, a warning will be
   * logged to the user, and the file will not be included in the final resolved pages set.
   */
  resolvePage?(
    id: string,
    env: AppEnv
  ):
    | Omit<ServerPage, 'filePath'>
    | null
    | void
    | Promise<Omit<ServerPage, 'filePath'> | null | void>;
};

export type PluginOption = Plugin | false | null | undefined;

export type Plugins = (PluginOption | PluginOption[])[];

export type FilteredPlugins = Plugin[];
