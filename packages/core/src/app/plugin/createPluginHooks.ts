import { createPluginHookQueue } from './createPluginHookQueue.js';
import type { PluginManager } from './PluginManager.js';

export const createPluginHooks = (): PluginManager['hooks'] => ({
  // Lifecycle Hooks
  beforeInit: createPluginHookQueue('beforeInit'),
  afterInit: createPluginHookQueue('afterInit'),
  beforePrepare: createPluginHookQueue('beforePrepare'),
  afterPrepare: createPluginHookQueue('afterPrepare'),

  // Markdown
  configureMarkdownIt: createPluginHookQueue('configureMarkdownIt'),
  extendMarkdownPageOptions: createPluginHookQueue('extendMarkdownPageOptions'),
  extendMarkdownPageData: createPluginHookQueue('extendMarkdownPageData'),

  // Story
  extendStoryPageOptions: createPluginHookQueue('extendStoryPageOptions'),
  extendStoryPageData: createPluginHookQueue('extendStoryPageData'),

  // Vite
  configureVite: createPluginHookQueue('configureVite'),

  // Client Hooks
  clientAppEnhanceFiles: createPluginHookQueue('clientAppEnhanceFiles'),
  clientAppRootComponentFiles: createPluginHookQueue(
    'clientAppRootComponentFiles'
  ),
  clientAppSetupFiles: createPluginHookQueue('clientAppSetupFiles')
});
