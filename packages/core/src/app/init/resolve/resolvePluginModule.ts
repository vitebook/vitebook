import {
  hasDefaultExport,
  loadModule,
  requireResolve
} from '../../../utils/module.js';
import { path } from '../../../utils/path.js';
import { normalizePackageName } from '../../../utils/pkg.js';
import type {
  DefaultPluginOptions,
  Plugin,
  PluginObject
} from '../../plugin/Plugin.js';

/**
 * Resolve the module of a plugin according to name or path.
 */
export const resolvePluginModule = async <
  T extends DefaultPluginOptions = DefaultPluginOptions,
  U extends PluginObject = PluginObject
>(
  pluginName: string
): Promise<Plugin<T, U> | null> => {
  const pluginEntry = path.isAbsolute(pluginName)
    ? pluginName
    : requireResolve(normalizePackageName(pluginName, 'vitebook', 'plugin'));

  if (pluginEntry === null) {
    return null;
  }

  const pluginModule = await loadModule(pluginEntry);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return hasDefaultExport<Plugin<any, any>>(pluginModule)
    ? pluginModule.default
    : pluginModule;
};
