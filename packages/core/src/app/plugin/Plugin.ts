import type { App } from '../App.js';
import type { PluginHooksExposed } from './PluginHooks.js';

/**
 * Vitebook plugin.
 *
 * A plugin should be rather:
 * - an object (`PluginObject`)
 * - a function that returns an object (`PluginFunction`)
 *
 * A plugin package should have a `Plugin` as the default export.
 */
export type Plugin<
  T extends DefaultPluginOptions = DefaultPluginOptions,
  U extends PluginObject = PluginObject
> = U | PluginFunction<T, U>;

/**
 * Vitebook plugin function.
 *
 * It accepts plugin options and Vitebook app, returns a plugin object.
 */
export type PluginFunction<
  T extends DefaultPluginOptions = DefaultPluginOptions,
  U extends PluginObject = PluginObject
> = (config: Partial<T>, app: App) => U;

/**
 * Vitebook plugin object.
 */
export type PluginObject = Partial<PluginHooksExposed> & {
  /**
   * Plugin name.
   */
  name: string;
};

/**
 * Vitebook plugin default options.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DefaultPluginOptions = Record<string, any>;

/**
 * Plugin config to be used in user config file.
 *
 * Users can use this config to control which plugins to be used, and set the plugin options.
 */
export type PluginConfig<
  T extends DefaultPluginOptions = DefaultPluginOptions
> =
  | string
  | Plugin<T>
  | [string | Plugin<T>]
  | [string | Plugin<T>, Partial<T> | boolean];

/**
 * Normalized plugin config.
 */
export type PluginConfigNormalized<
  T extends DefaultPluginOptions = DefaultPluginOptions
> = [Plugin<T> | string, Partial<T> | boolean];
