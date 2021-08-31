import debug from 'debug';

import type { App } from '../App.js';
import { createAppPages } from './create/createAppPages.js';

const log = debug('vitebook:core/app');

/**
 * Initialize a Vitebook app. Plugins should be used before initialization.
 */
export const initApp = async (app: App): Promise<void> => {
  log('init start');

  // - Register all hooks of plugins that have been used.
  // - Plugins should be used before `registerHooks()`.
  // - Hooks in plugins will take effect after `registerHooks()`.
  app.pluginManager.registerHooks();

  await app.pluginManager.hooks.beforeInit.process(app);

  await app.pluginManager.hooks.configureMarkdownIt.process(
    app.markdown.parser,
    app
  );

  app.pages = await createAppPages(app);

  await app.pluginManager.hooks.afterInit.process(app);

  log('init finish');
};
