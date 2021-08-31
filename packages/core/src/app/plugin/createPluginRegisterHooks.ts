import { normalizeClientFilesHook } from './normalizeClientFilesHook';
import type { PluginManager } from './PluginManager.js';

export const createPluginRegisterHooks =
  (
    plugins: PluginManager['plugins'],
    hooks: PluginManager['hooks']
  ): PluginManager['registerHooks'] =>
  () => {
    plugins.forEach(
      ({
        name: pluginName,

        clientAppEnhanceFiles,
        clientAppRootComponentFiles,
        clientAppSetupFiles,

        ...commonHooks
      }) => {
        if (clientAppEnhanceFiles) {
          hooks.clientAppEnhanceFiles.add({
            pluginName,
            hook: normalizeClientFilesHook(clientAppEnhanceFiles)
          });
        }

        if (clientAppRootComponentFiles) {
          hooks.clientAppRootComponentFiles.add({
            pluginName,
            hook: normalizeClientFilesHook(clientAppRootComponentFiles)
          });
        }

        if (clientAppSetupFiles) {
          hooks.clientAppSetupFiles.add({
            pluginName,
            hook: normalizeClientFilesHook(clientAppSetupFiles)
          });
        }

        /**
         * common hooks
         */
        Object.entries(commonHooks).forEach(([key, hook]) => {
          if (hooks[key] && hook) {
            hooks[key].add({
              pluginName,
              hook
            });
          }
        });
      }
    );
  };
