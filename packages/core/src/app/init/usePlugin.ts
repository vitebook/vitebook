import debug from 'debug';
import kleur from 'kleur';

import { formatWarnMsg, warn } from '../../utils/logger.js';
import type { App } from '../App.js';
import type { DefaultPluginOptions, Plugin } from '../plugin/Plugin.js';
import { resolvePlugin } from './resolve/resolvePlugin.js';

const log = debug('vitebook:core/app');

export const usePlugin = async <T extends DefaultPluginOptions>(
  app: App,
  rawPlugin: Plugin<T> | string,
  config?: Partial<T>
): Promise<App> => {
  const plugin = await resolvePlugin(app, rawPlugin, config);

  log(`use plugin ${kleur.bold(plugin.name)}`);

  const duplicateIndex = app.pluginManager.plugins.findIndex(
    ({ name }) => name === plugin.name
  );

  if (duplicateIndex !== -1) {
    app.pluginManager.plugins.splice(duplicateIndex, 1);

    warn(
      formatWarnMsg(
        `plugin ${kleur.bold(
          plugin.name
        )} has been used multiple times, only the last one will take effect`
      )
    );
  }

  app.pluginManager.plugins.push(plugin);

  return app;
};
