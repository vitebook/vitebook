import { createPluginHooks } from './createPluginHooks';
import { createPluginRegisterHooks } from './createPluginRegisterHooks';
import type { PluginManager } from './PluginManager.js';

export const createPluginManager = (): PluginManager => {
  const plugins: PluginManager['plugins'] = [];
  const hooks = createPluginHooks();
  const registerHooks = createPluginRegisterHooks(plugins, hooks);

  return {
    plugins,
    hooks,
    registerHooks
  };
};
