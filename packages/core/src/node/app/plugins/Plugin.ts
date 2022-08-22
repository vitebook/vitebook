import type { Plugin as VitePlugin } from 'vite';

import type { App } from '../App';
import type { AppConfig, ResolvedAppConfig } from '../AppConfig';

export type VitebookPlugin = VitePlugin & {
  vitebook?: {
    /**
     * Whether to run before core Vitebook plugins or after.
     */
    enforce?: 'pre' | 'post';
    /**
     * Overrides client and server entry files.
     */
    entry?: App['entry'];
    /**
     * Hook for extending the Vitebook app configuration.
     */
    config?: (
      config: ResolvedAppConfig,
    ) =>
      | Omit<AppConfig, 'dirs'>
      | null
      | void
      | Promise<Omit<AppConfig, 'dirs'> | null | void>;
    /**
     * Called immediately after the config has been resolved.
     */
    configureApp?: (app: App) => void | Promise<void>;
  };
};

export type VitebookPluginOption = VitebookPlugin | false | null | undefined;

export type VitebookPluginOptions =
  | VitebookPluginOption
  | Promise<VitebookPluginOption>
  | (VitebookPluginOption | Promise<VitebookPluginOption>)[];

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
};
