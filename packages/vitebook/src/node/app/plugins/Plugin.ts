import type { Plugin as VitePlugin } from 'vite';

import type { App } from '../App';
import type { AppConfig, ResolvedAppConfig } from '../config';

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
