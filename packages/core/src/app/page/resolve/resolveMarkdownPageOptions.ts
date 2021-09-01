import type { App } from '../../App.js';
import type { MarkdownPageOptions } from '../MarkdownPage.js';

export const resolveMarkdownPageOptions = async ({
  app,
  optionsRaw
}: {
  app: App;
  optionsRaw: MarkdownPageOptions;
}): Promise<MarkdownPageOptions> => {
  const options = { ...optionsRaw };

  const extendsPageOptions =
    await app.pluginManager.hooks.extendMarkdownPageOptions.process(
      options,
      app
    );

  extendsPageOptions.forEach((item) => Object.assign(options, item));

  return options;
};
