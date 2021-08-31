import kleur from 'kleur';

import { formatErrorMsg, logger } from '../../../utils/logger.js';
import { isFunction, isString } from '../../../utils/unit.js';
import type { App } from '../../App.js';
import type {
  DefaultPluginOptions,
  Plugin,
  PluginObject
} from '../../plugin/Plugin.js';
import { resolvePluginModule } from './resolvePluginModule.js';

/**
 * Resolve a plugin according to name/path/module and config.
 */
export const resolvePlugin = async <
  T extends DefaultPluginOptions = DefaultPluginOptions,
  U extends PluginObject = PluginObject
>(
  app: App,
  plugin: Plugin<T, U> | string,
  config: Partial<T> = {}
): Promise<U> => {
  const pluginModule = isString(plugin)
    ? await resolvePluginModule<T, U>(plugin)
    : plugin;

  if (pluginModule === null) {
    throw logger.createError(
      formatErrorMsg(
        `plugin not found: ${kleur.bold(
          isString(plugin) ? plugin : plugin.name
        )}`
      )
    );
  }

  const pluginObject = isFunction(pluginModule)
    ? pluginModule(config, app)
    : pluginModule;

  return pluginObject as U;
};
