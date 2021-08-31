import { isArray } from '../../../utils/unit.js';
import type {
  DefaultPluginOptions,
  PluginConfig,
  PluginConfigNormalized
} from '../../plugin/Plugin.js';

export const normalizePluginConfig = <T extends DefaultPluginOptions>(
  pluginConfig: PluginConfig<T>
): PluginConfigNormalized<T> => {
  // ['container'] -> ['container', true]
  // ['container', options] -> ['container', options]
  if (isArray(pluginConfig)) {
    return [pluginConfig[0], pluginConfig[1] ?? true];
  }

  // 'container' -> ['container', true]
  return [pluginConfig, true];
};
