/* eslint-disable @typescript-eslint/no-explicit-any */

import type { UserConfig as ViteConfig } from 'vite';

import type { App } from '../App.js';
import type { Markdown } from '../markdown/Markdown.js';
import type {
  MarkdownPage,
  MarkdownPageOptions
} from '../page/MarkdownPage.js';
import type { StoryPage, StoryPageOptions } from '../page/StoryPage.js';

export type PluginHooks = {
  // Lifecycle
  beforeInit: LifeCyclePluginHook;
  afterInit: LifeCyclePluginHook;
  beforePrepare: LifeCyclePluginHook;
  afterPrepare: LifeCyclePluginHook;

  // Markdown
  configureMarkdownIt: MarkdownItPluginHook;
  extendMarkdownPageOptions: MarkdownPageOptionsPluginHook;
  extendMarkdownPageData: MarkdownPageDataPluginHook;

  // Story
  extendStoryPageOptions: StoryPageOptionsPluginHook;
  extendStoryPageData: StoryPageDataPluginHook;

  // Vite
  configureVite: ViteConfigPluginHook;

  // Client
  clientAppEnhanceFiles: ClientFilesPluginHook;
  clientAppSetupFiles: ClientFilesPluginHook;
  clientAppRootComponentFiles: ClientFilesPluginHook;
};

// Util types.
type PromiseOrNot<T> = Promise<T> | T;

// Base hook type.
export type PluginHook<
  Exposed,
  Normalized = Exposed,
  Result = Normalized extends (...args: any) => infer U
    ? U extends Promise<infer V>
      ? V
      : U
    : void
> = {
  exposed: Exposed;
  normalized: Normalized;
  result: Result;
};

// Lifecycle hook.
export type LifeCyclePluginHook<T extends unknown[] = []> = PluginHook<
  (app: App, ...args: T) => PromiseOrNot<void>
>;

// Hook that generates client files.
export type ClientFilesPluginHook = PluginHook<
  string | string[] | ((app: App) => PromiseOrNot<string | string[]>),
  (app: App) => Promise<string[]>
>;

// Hook that returns an object.
export type ReturnObjectPluginHook = PluginHook<
  Record<string, any> | ((app: App) => PromiseOrNot<Record<string, any>>),
  (app: App) => Promise<Record<string, any>>
>;

// Markdown hook.
export type MarkdownItPluginHook = PluginHook<
  (md: Markdown, app: App) => PromiseOrNot<void>
>;

// Page hooks.
export type MarkdownPageOptionsPluginHook = PluginHook<
  (options: MarkdownPageOptions, app: App) => PromiseOrNot<MarkdownPageOptions>
>;

export type MarkdownPageDataPluginHook = PluginHook<
  (
    page: Omit<MarkdownPage, 'data'>,
    app: App
  ) => PromiseOrNot<Record<string, any>>
>;

export type StoryPageOptionsPluginHook = PluginHook<
  (options: StoryPageOptions, app: App) => PromiseOrNot<StoryPageOptions>
>;

export type StoryPageDataPluginHook = PluginHook<
  (page: Omit<StoryPage, 'data'>, app: App) => PromiseOrNot<Record<string, any>>
>;

// Vite hook.
export type ViteConfigPluginHook = PluginHook<
  (config: ViteConfig, app: App) => PromiseOrNot<ViteConfig>
>;

/**
 * Name of hooks.
 */
export type PluginHookNames = keyof PluginHooks;

/**
 * Exposed hooks API that can be accessed by a plugin.
 */
export type PluginHooksExposed = {
  [K in PluginHookNames]: PluginHooks[K]['exposed'];
};

export type PluginHooksNormalized = {
  [K in PluginHookNames]: PluginHooks[K]['normalized'];
};

export type PluginHooksResult = {
  [K in PluginHookNames]: PluginHooks[K]['result'];
};

export type PluginHookItem<T extends PluginHookNames> = {
  // The name of the plugin who introduce this hook.
  pluginName: string;
  // The normalized hook.
  hook: PluginHooksNormalized[T];
};

export type PluginHookQueue<T extends PluginHookNames> = {
  name: T;
  items: PluginHookItem<T>[];
  add: (item: PluginHookItem<T>) => void;
  process: (
    ...args: Parameters<PluginHooksNormalized[T]>
  ) => Promise<PluginHooksResult[T][]>;
};
