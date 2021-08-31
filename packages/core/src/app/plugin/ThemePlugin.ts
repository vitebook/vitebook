import type {
  Plugin,
  PluginConfig,
  PluginFunction,
  PluginObject
} from './Plugin.js';

/**
 * A Vitebook theme is a special type of plugin which can be:
 *
 * - an object (`ThemePluginObject`)
 * - a function that returns an object (`ThemePluginFunction`)
 *
 * A theme package should have a `Theme` as the default export.
 */
export type ThemePlugin<T extends ThemePluginConfig = ThemePluginConfig> =
  Plugin<T, ThemePluginObject>;

export type ThemePluginFunction<
  T extends ThemePluginConfig = ThemePluginConfig
> = PluginFunction<T, ThemePluginObject>;

export type ThemePluginObject = PluginObject & {
  /**
   * Parent theme to extend.
   */
  extends?: string;

  /**
   * Specify the layouts directory or components map.
   */
  layouts?: string | Record<string, string>;

  /**
   * Theme specific plugins.
   */
  plugins?: PluginConfig[];
};

/**
 * Theme config to be used in user config file. It will be used by a theme itself, but not by
 * Vitebook, we will only transfer this config to theme.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ThemePluginConfig = Record<string, any>;

/**
 * Resolved theme info.
 */
export type ThemePluginInfo = {
  /**
   * Layout components.
   */
  layouts: Record<string, string>;

  /**
   * Plugins, including theme itself and plugins used by theme.
   */
  plugins: PluginObject[];
};
