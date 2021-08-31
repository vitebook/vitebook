import debug from 'debug';

import { globby } from '../../../utils/fs.js';
import type { App } from '../../App.js';
import { createPage } from '../../page/createPage.js';
import type { Page } from '../../page/Page.js';
import { PageType } from '../../page/PageType.js';
import { resolveStoryOptionsFromConfig } from '../resolve/resolveStoryOptionsFromConfig.js';

const log = debug('vitebook:core/app');

export const createAppPages = async (app: App): Promise<Page[]> => {
  log('createAppPages start');

  const pagePaths = await globby.sync(app.options.pages, {
    cwd: app.dirs.src.resolve()
  });

  const pages = await Promise.all(
    pagePaths.map(async (filePath) => {
      const isMarkdownPage = /(\.md)$/.test(filePath);

      const options = isMarkdownPage
        ? { filePath }
        : await resolveStoryOptionsFromConfig(filePath);

      return createPage(app, {
        type: isMarkdownPage ? PageType.Markdown : PageType.Story,
        ...options
      });
    })
  );

  // If there is no 404 page, add one.
  if (!pages.some((page) => page.path === '/404.html')) {
    pages.push(
      await createPage(app, {
        type: PageType.Markdown,
        path: '/404.html',
        frontmatter: {
          layout: '404'
        }
      })
    );
  }

  log('createAppPages finish');

  return pages;
};
