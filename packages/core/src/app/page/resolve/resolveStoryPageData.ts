import type { App } from '../../App.js';
import type { StoryPageData } from '../data/StoryPageData.js';
import type { StoryOptions } from '../StoryOptions.js';
import type { StoryPage } from '../StoryPage.js';

export const resolveStoryPageData = async ({
  app,
  page
}: {
  app: App;
  page: Omit<StoryPage, 'data'> & StoryOptions;
}): Promise<StoryPageData> => {
  const { type, key, path, name, description, lang, component, head, locales } =
    page;

  const data: StoryPageData = {
    type,
    key,
    path,
    name,
    title: name,
    description,
    lang,
    component,
    locales,
    head
  };

  const extendsPageData =
    await app.pluginManager.hooks.extendStoryPageData.process(page, app);

  extendsPageData.forEach((item) => Object.assign(data, item));

  return data;
};
