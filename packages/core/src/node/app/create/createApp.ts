import { loadConfigFromFile } from 'vite';

import type { App, AppEnv } from '../App';
import type { AppConfig } from '../AppOptions';
import type { ClientPlugin } from '../plugin/ClientPlugin';
import type { FilteredPlugins } from '../plugin/Plugin';
import { build } from '../vite/build/build';
import { corePlugin, ssrPlugin } from '../vite/dev/corePlugin';
import { createServer } from '../vite/dev/createServer';
import { preview } from '../vite/preview';
import { createAppDirs } from './createAppDirs';
import { createAppEnv } from './createAppEnv';
import { createAppOptions } from './createAppOptions';
import { DisposalBin } from './DisposalBin';
import { getAppVersion } from './getAppVersion';

export const createApp = async (
  config: AppConfig,
  envConfig?: Partial<AppEnv>,
): Promise<App> => {
  const version = getAppVersion();
  const options = createAppOptions(config);
  const dirs = createAppDirs(options);

  const env = createAppEnv({
    ...envConfig,
    isDebug: options.debug ?? envConfig?.isDebug,
  });

  const core = corePlugin();

  const client = options.plugins
    .flat()
    .find((plugin) => plugin && 'entry' in plugin);

  const plugins = [core, ssrPlugin(), ...options.plugins.flat()].filter(
    (plugin) => !!plugin,
  ) as FilteredPlugins;

  const vite = await loadConfigFromFile({
    command: config.cliArgs?.command === 'build' ? 'build' : 'serve',
    mode: config.cliArgs?.command === 'dev' ? 'development' : 'production',
  });

  const app: App = {
    version,
    options,
    env,
    dirs,
    plugins,
    vite,
    pages: [],
    context: {},
    client: (client as ClientPlugin) ?? core,
    disposal: new DisposalBin(),
    dev: () => createServer(app),
    build: () => build(app),
    preview: () => preview(app),
    close: () => app.disposal.empty(),
  };

  for (const plugin of plugins) {
    await plugin.configureApp?.(app, env);
  }

  return app;
};
