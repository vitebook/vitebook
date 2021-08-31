import type {
  Plugin,
  PluginConfig,
  PluginFunction,
  PluginObject
} from './Plugin.js';

/**
 * A Vitebook theme is a special type of plugin which can be a:
 *
 * - an object (`ThemeObject`)
 * - a function that returns an object (`ThemeFunction`)
 *
 * A theme package should have a `Theme` as the default export.
 */
export type Theme<T extends ThemeConfig = ThemeConfig> = Plugin<T, ThemeObject>;

export type ThemeFunction<T extends ThemeConfig = ThemeConfig> = PluginFunction<
  T,
  ThemeObject
>;

export type ThemeObject = PluginObject & {
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
export type ThemeConfig = Record<string, any>;

/**
 * Resolved theme info.
 */
export type ThemeInfo = {
  /**
   * Layout components.
   */
  layouts: Record<string, string>;

  /**
   * Plugins, including theme itself and plugins used by theme.
   */
  plugins: PluginObject[];
};
