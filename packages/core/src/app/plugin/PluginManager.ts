import type { PluginObject } from './Plugin.js';
import type { PluginHookNames, PluginHookQueue } from './PluginHooks.js';

export interface PluginManager {
  plugins: PluginObject[];

  hooks: {
    [K in PluginHookNames]: PluginHookQueue<K>;
  };

  /**
   * Register hooks of plugins.
   *
   * Should be invoked before applying a hook.
   */
  registerHooks: () => void;
}
