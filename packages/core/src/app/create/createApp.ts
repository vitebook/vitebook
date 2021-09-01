import { mergeConfig } from 'vite';

import { formatErrorMsg, logger } from '../../utils/logger.js';
import { isObject } from '../../utils/unit.js';
import type { App } from '../App.js';
import type { AppConfig } from '../AppOptions.js';
import type { ClientPlugin } from '../plugin/ClientPlugin.js';
import type { SiteOptions } from '../site/SiteOptions.js';
import { createBuild } from '../vite/build/createBuild.js';
import { createDev } from '../vite/dev/createDev.js';
import { createAppDirs } from './createAppDirs.js';
import { createAppEnv } from './createAppEnv.js';
import { createAppOptions } from './createAppOptions.js';
import { createSiteOptions } from './createSiteOptions.js';
import { getAppVersion } from './getAppVersion.js';

export const createApp = async (
  config: AppConfig,
  isBuild = false
): Promise<App> => {
  const version = getAppVersion();
  const options = createAppOptions(config);
  const dirs = createAppDirs(options);
  const env = createAppEnv(options, isBuild);

  const site = {
    options: createSiteOptions(config.site ?? {})
  };

  const client = options.plugins
    .flat()
    .find((plugin) => plugin && 'entry' in plugin);

  if (!client) {
    // TODO: add docs link in msg later when available.
    throw logger.createError(formatErrorMsg('No client plugin was provided.'));
  }

  const app: App = {
    version,
    options,
    env,
    dirs,
    site,
    context: {},
    client: client as ClientPlugin,
    dev: () => createDev(app),
    build: () => createBuild(app)
  };

  for (const plugin of options.plugins.flat()) {
    if (plugin) {
      // Configure.
      await plugin.configureApp?.(app);

      // Site data.
      const siteData = await plugin.siteData?.(site.options);
      if (isObject(siteData)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        site.options = mergeConfig(siteData, site.options) as SiteOptions<any>;
      }
    }
  }

  for (const plugin of options.plugins.flat()) {
    if (plugin) {
      await plugin.siteDataResolved?.(site.options);
    }
  }

  return app;
};
