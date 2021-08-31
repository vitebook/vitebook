import type { App } from '../../App.js';
import type { AppConfig } from '../../AppOptions.js';
import { createMarkdownIt } from '../../markdown/createMarkdown.js';
import { createPluginManager } from '../../plugin/createPluginManager.js';
import { initApp } from '../initApp.js';
import { prepareApp } from '../prepareApp.js';
import { resolvePluginsFromConfig } from '../resolve/resolvePluginsFromConfig.js';
import { resolveThemeInfo } from '../resolve/resolveThemeInfo.js';
import { usePlugin } from '../usePlugin.js';
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
  const pluginManager = createPluginManager();

  const markdown = {
    parser: createMarkdownIt(options.markdown),
    options: options.markdown
  };

  const site = {
    options: createSiteOptions(config.site ?? {})
  };

  // @ts-expect-error - Spread args don't match usePlugin type.
  const use = (...args) => usePlugin(app, ...args);
  const init = () => initApp(app);
  const prepare = () => prepareApp(app);

  const app = {
    version,
    options,
    env,
    dirs,
    markdown,
    site,
    pluginManager,
    use,
    init,
    prepare
  } as App;

  // Theme
  const themeInfo = await resolveThemeInfo(app, site.options.theme);

  for (const themePlugin of themeInfo.plugins) {
    await use(app, themePlugin);
  }

  app.layouts = themeInfo.layouts;

  // Plugins
  const plugins = await resolvePluginsFromConfig(app, options.plugins);

  for (const plugin of plugins) {
    await usePlugin(app, plugin);
  }

  // dev: () => Promise<ViteDevServer>;
  // build: () => Promise<unknown>;

  return app;
};
