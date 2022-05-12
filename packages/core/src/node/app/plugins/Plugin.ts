import type { Plugin as VitePlugin } from 'vite';

import type { App, AppEnv } from '../App';

export type Plugin = VitePlugin & {
  /**
   * Configure the Vitebook application. This can also be used to store a reference to the
   * app for use in other hooks. Use the `context` property to store global data.
   *
   * This hook is called after the application has initialized (all options have been resolved),
   * but in parallel with the `siteData` hook.
   */
  configureApp?: (app: App, env: AppEnv) => void | Promise<void>;
};

export type ResolvePageContext = {
  /** Default page module id. Can be overwritten by plugin. */
  id: string;
  /** Absolute system file path of page file. */
  filePath: string;
  /** System file path to page file relative to `<rootDir>` .  */
  relativeFilePath: string;
  /** Safely read file content (avoid empty buffer issues). */
  read: () => Promise<string>;
  /**
   * Page client-side route inferred from file path such as `/pages/page.html`. Can be overwritten
   * by plugin.
   */
  route: string;
  /** Application environment information. */
  env: AppEnv;
};

export type PluginOption = Plugin | false | null | undefined;
export type Plugins = (PluginOption | PluginOption[])[];
export type FilteredPlugins = Plugin[];
