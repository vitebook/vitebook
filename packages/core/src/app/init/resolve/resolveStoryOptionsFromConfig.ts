import { loadModule } from '../../../utils/module.js';
import { path } from '../../../utils/path.js';
import type { StoryConfig, StoryOptions } from '../../page/StoryOptions.js';

export const resolveStoryOptionsFromConfig = async (
  filePath: string
): Promise<StoryOptions> => {
  const mod = await loadModule<{ default: StoryConfig }>(filePath, {
    cache: false
  });

  const storyConfig = mod.default ?? {};

  return {
    name: storyConfig.name ?? path.trimExt(path.basename(filePath)),
    description: storyConfig.description ?? '',
    component: storyConfig.component ?? '',
    head: storyConfig.head ?? [],
    locales: storyConfig.locales ?? {}
  };
};
