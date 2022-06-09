import type { Plugin as VitePlugin } from 'vite';

import type { App, AppEnv } from '../App';
import { type ResolvedAppConfig } from '../AppConfig';

export type Plugin = VitePlugin & {
  /**
   * Similar to the Vite `enforce` option except for Vitebook plugins.
   */
  vitebookEnforce?: 'pre' | 'post';
  /**
   * Hook for extending the Vitebook app configuration. This is after the App config has
   * been resolved with defaults, so all options are defined. This hook is called before Vite or
   * any plugins have started.
   */
  vitebookConfig?: (
    config: ResolvedAppConfig,
    env: AppEnv,
  ) => void | Promise<void>;
  /**
   * Configure the Vitebook application instance. This can also be used to store a reference to the
   * app for use in other hooks. This hook is called after the application has been initialized.
   */
  vitebookInit?: (app: App, env: AppEnv) => void | Promise<void>;
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
