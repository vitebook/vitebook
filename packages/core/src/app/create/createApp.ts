import { mergeConfig } from 'vite';

import { logger } from '../../utils/logger.js';
import { isObject } from '../../utils/unit.js';
import type { App, AppEnv } from '../App.js';
import type { AppConfig } from '../AppOptions.js';
import type { ClientPlugin } from '../plugin/ClientPlugin.js';
import type { FlattenedPlugins } from '../plugin/Plugin.js';
import type { SiteOptions } from '../site/SiteOptions.js';
import { build } from '../vite/build/build.js';
import { dev } from '../vite/dev/dev.js';
import { serve } from '../vite/server/serve.js';
import { createAppDirs } from './createAppDirs.js';
import { createAppEnv } from './createAppEnv.js';
import { createAppOptions } from './createAppOptions.js';
import { createSiteOptions } from './createSiteOptions.js';
import { getAppVersion } from './getAppVersion.js';

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
    .find((plugin) => plugin && 'entry' in plugin);

  // TODO: re-enable && add docs link in msg later when available.
  // if (!client) {
  //   throw logger.createError('No client plugin was found.');
  // }

  const plugins: FlattenedPlugins = [
    client,
    ...options.plugins.flat(),
    ...(options.vite.plugins ?? []).flat()
  ];

  const app: App = {
    version,
    options,
    env,
    dirs,
    site,
    plugins,
    context: {},
    client: client as ClientPlugin,
    dev: () => dev(app, config),
    build: () => build(app, config),
    serve: () => serve(app)
  };

  for (const plugin of plugins) {
    if (plugin) {
      await plugin.configureApp?.(app, env);

      // Site data.
      const siteData = await plugin.siteData?.(site.options, env);
      if (isObject(siteData)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        site.options = mergeConfig(siteData, site.options) as SiteOptions<any>;
      }
    }
  }

  for (const plugin of plugins) {
    if (plugin) {
      await plugin.siteDataResolved?.(site.options);
    }
  }

  return app;
};
