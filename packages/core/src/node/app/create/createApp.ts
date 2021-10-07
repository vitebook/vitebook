import { mergeConfig } from 'vite';

import { isObject, SiteOptions } from '../../../shared';
import { logger } from '../../utils/logger';
import type { App, AppEnv } from '../App';
import type { AppConfig } from '../AppOptions';
import type { ClientPlugin } from '../plugin/ClientPlugin';
import type { FilteredPlugins } from '../plugin/Plugin';
import { build } from '../vite/build';
import { createServer } from '../vite/dev/createServer';
import { serve } from '../vite/serve';
import { createAppDirs } from './createAppDirs';
import { createAppEnv } from './createAppEnv';
import { createAppOptions } from './createAppOptions';
import { createSiteOptions } from './createSiteOptions';
import { DisposalBin } from './DisposalBin';
import { getAppVersion } from './getAppVersion';
import { resolveConfigPath } from './resolveConfigPath';

export const createApp = async (
  config: AppConfig,
  envConfig?: Partial<AppEnv>
): Promise<App> => {
  const version = getAppVersion();
  const options = createAppOptions(config);
  const dirs = createAppDirs(options);

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

  const configPath = resolveConfigPath(dirs.config.path);

  const plugins = [
    ...options.plugins.flat(),
    ...(options.vite.plugins ?? []).flat()
  ].filter((plugin) => !!plugin) as FilteredPlugins;

  const app: App = {
    version,
    options,
    configPath,
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
