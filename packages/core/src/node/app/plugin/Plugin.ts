import type { Plugin as VitePlugin } from 'vite';

import type { ResolvedPage, ServerPage } from '../../../shared';
import type { App, AppEnv } from '../App';
import type { MarkdownParser } from '../markdown/types';

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
   * Configure the underlying markdown parser.
   *
   * @param parser - MarkdownIt instance.
   */
  configureMarkdownParser?(parser: MarkdownParser): void | Promise<void>;

  /**
   * Server-side Vitebook will resolve the `include` glob array the user has provided which will
   * return a list of file paths that are possible pages. The file paths will be resolved to pages
   * via this hook.
   *
   * Similarly to the Rollup `resolve` hook, `resolvePage` will be run sequentially on each
   * plugin until a page is successfully resolved. If no plugin resolves a path to a page,
   * a warning will be logged to the user that no plugin can resolve this file path.
   *
   * Try to keep this hook light and leave file processing and transforms on a per-request
   * basis. Preferably defer work to the Vite `load` and `transform` hooks.
   *
   * Note: this hook will be called more than once as the user makes changes to files.
   */
  resolvePage?(
    ctx: ResolvePageContext,
  ):
    | ResolvedPage
    | null
    | undefined
    | void
    | Promise<ResolvedPage | null | undefined | void>;

  /**
   * Called when pages have been removed by the user.
   */
  pagesRemoved?(pages: ServerPage[]): void | Promise<void>;

  /**
   * Use this hook to read and store resolved pages. This hook will be called more than once
   * as the user makes changes and new pages are resolved or removed.
   */
  pagesResolved?(pages: ServerPage[]): void | Promise<void>;
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
