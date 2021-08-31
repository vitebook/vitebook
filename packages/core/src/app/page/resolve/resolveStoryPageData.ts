import type { App } from '../../App.js';
import type { StoryPageData } from '../data/StoryPageData.js';
import type { StoryPage } from '../StoryPage.js';

/**
 * Resolve story page data.
 */
export const resolveStoryPageData = async ({
  app,
  page
}: {
  app: App;
  page: Omit<StoryPage, 'data'>;
}): Promise<StoryPageData> => {
  const { type, key, path, name, description, lang, component } = page;

  const data: StoryPageData = {
    type,
    key,
    path,
    name,
    description,
    lang,
    component
  };

  const extendsPageData =
    await app.pluginManager.hooks.extendStoryPageData.process(page, app);

  extendsPageData.forEach((item) => Object.assign(data, item));

  return data;
};
