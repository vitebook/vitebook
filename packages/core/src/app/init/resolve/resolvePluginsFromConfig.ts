import type { App } from '../../App.js';
import type { PluginConfig, PluginObject } from '../../plugin/Plugin.js';
import { normalizePluginConfig } from './normalizePluginConfig.js';
import { resolvePlugin } from './resolvePlugin.js';

/**
 * Resolve plugins from plugin config array.
 */
export const resolvePluginsFromConfig = async (
  app: App,
  plugins: PluginConfig[] = []
): Promise<PluginObject[]> => {
  const pluginObjects: PluginObject[] = [];

  for (const pluginConfig of plugins) {
    const [plugin, config] = normalizePluginConfig(pluginConfig);

    if (config !== false) {
      const pluginObject = await resolvePlugin(
        app,
        plugin,
        config === true ? {} : config
      );

      pluginObjects.push(pluginObject);
    }
  }

  return pluginObjects;
};
