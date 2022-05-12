import { loadConfigFromFile } from 'vite';

import type { App, AppEnv } from '../App';
import type { AppConfig } from '../AppOptions';
import type { ClientPlugin } from '../plugin/ClientPlugin';
import type { FilteredPlugins } from '../plugin/Plugin';
import { build } from '../vite/build/build';
import { createServer } from '../vite/createServer';
import { corePlugin } from '../vite/plugins/corePlugin';
import { markdownPlugin } from '../vite/plugins/markdownPlugin';
import { ssrPlugin } from '../vite/plugins/ssrPlugin';
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

  const vite = await loadConfigFromFile({
    command: config.cliArgs?.command === 'build' ? 'build' : 'serve',
    mode: config.cliArgs?.command === 'dev' ? 'development' : 'production',
  });

  const options = createAppOptions({
    ...config,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(vite?.config as any).book,
  });

  const dirs = createAppDirs(options);

  const env = createAppEnv({
    ...envConfig,
    isDebug: options.debug ?? envConfig?.isDebug,
  });

  const core = corePlugin();

  const client = options.plugins
    .flat()
    .find((plugin) => plugin && 'entry' in plugin);

  const plugins = [
    core,
    ssrPlugin(),
    markdownPlugin(options.markdown),
    ...options.plugins.flat(),
  ].filter((plugin) => !!plugin) as FilteredPlugins;

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
