import type { App } from '../../App.js';
import type { StoryPageOptions } from '../StoryPage.js';

export const resolveStoryPageOptions = async ({
  app,
  optionsRaw
}: {
  app: App;
  optionsRaw: StoryPageOptions;
}): Promise<StoryPageOptions> => {
  const options = { ...optionsRaw };

  const extendsPageOptions =
    await app.pluginManager.hooks.extendStoryPageOptions.process(
      optionsRaw,
      app
    );

  extendsPageOptions.forEach((item) => Object.assign(options, item));

  return options;
};
