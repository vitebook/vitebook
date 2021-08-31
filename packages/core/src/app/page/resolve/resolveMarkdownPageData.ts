import type { App } from '../../App.js';
import type { MarkdownPageData } from '../data/MarkdownPageData.js';
import type { MarkdownPage } from '../MarkdownPage.js';

export const resolveMarkdownPageData = async ({
  app,
  page
}: {
  app: App;
  page: Omit<MarkdownPage, 'data'>;
}): Promise<MarkdownPageData> => {
  const { type, key, path, title, lang, frontmatter, excerpt, headers } = page;

  const data: MarkdownPageData = {
    type,
    key,
    path,
    title,
    lang,
    frontmatter,
    excerpt,
    headers
  };

  const extendsPageData =
    await app.pluginManager.hooks.extendMarkdownPageData.process(page, app);

  extendsPageData.forEach((item) => Object.assign(data, item));

  return data;
};
