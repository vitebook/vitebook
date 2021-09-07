import { mergeConfig } from 'vite';

import { logger } from '../../utils/logger.js';
import { isObject } from '../../utils/unit.js';
import type { App, AppEnv } from '../App.js';
import type { AppConfig } from '../AppOptions.js';
import type { ClientPlugin } from '../plugin/ClientPlugin.js';
import type { FilteredPlugins } from '../plugin/Plugin.js';
import type { SiteOptions } from '../site/SiteOptions.js';
import { build } from '../vite/build.js';
import { createServer } from '../vite/dev/createServer.js';
import { serve } from '../vite/serve.js';
import { createAppDirs } from './createAppDirs.js';
import { createAppEnv } from './createAppEnv.js';
import { createAppOptions } from './createAppOptions.js';
import { createSiteOptions } from './createSiteOptions.js';
import { DisposalBin } from './DisposalBin.js';
import { getAppVersion } from './getAppVersion.js';
import { resolveConfigPath } from './resolveConfigPath.js';
import { resolveThemePath } from './resolveThemePath.js';

export const createApp = async (
  config: AppConfig,
  envConfig?: Partial<AppEnv>
): Promise<App> => {
  const version = getAppVersion();
  const options = createAppOptions(config);
  const dirs = createAppDirs(options);
  const configPath = resolveConfigPath(dirs.config.path);

  const env = createAppEnv({
    ...envConfig,
    isDebug: options.debug ?? envConfig?.isDebug
  });

  const site = {
    options: createSiteOptions(config.site ?? {})
  };

  const client = options.plugins
    .flat()
    .find((plugin) => plugin && 'entry' in plugin) as ClientPlugin;

  if (!client) {
    throw logger.createError('No client plugin was found.');
  }

  const themePath = resolveThemePath(dirs.theme.path) ?? client.entry.theme;

  const plugins = [
    ...options.plugins.flat(),
    ...(options.vite.plugins ?? []).flat()
  ].filter((plugin) => !!plugin) as FilteredPlugins;

  const app: App = {
    version,
    options,
    configPath,
    themePath,
    env,
    dirs,
    site,
    plugins,
    pages: [],
    context: {},
    client,
    disposal: new DisposalBin(),
    dev: () => createServer(app),
    build: () => build(app),
    serve: () => serve(app),
    close: () => app.disposal.empty()
  };

  for (const plugin of plugins) {
    await plugin.configureApp?.(app, env);

    // Site data.
    const siteData = await plugin.siteData?.(site.options, env);
    if (isObject(siteData)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      site.options = mergeConfig(siteData, site.options) as SiteOptions<any>;
    }
  }

  for (const plugin of plugins) {
    await plugin.siteDataResolved?.(site.options);
  }

  return app;
};
