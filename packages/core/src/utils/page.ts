import type { MarkdownPageData } from '../app/page/data/MarkdownPageData.js';
import type { PageData } from '../app/page/data/PageData.js';
import type { StoryPageData } from '../app/page/data/StoryPageData.js';
import type { MarkdownPage } from '../app/page/MarkdownPage.js';
import type { Page } from '../app/page/Page.js';
import { PageType } from '../app/page/PageType.js';
import type { StoryPage } from '../app/page/StoryPage.js';

export const isMarkdownPageData = (
  pageData: PageData
): pageData is MarkdownPageData => {
  return pageData.type === PageType.Markdown;
};

export const isStoryPageData = (
  pageData: PageData
): pageData is StoryPageData => {
  return pageData.type === PageType.Story;
};

export const isMarkdownPage = (page: Page): page is MarkdownPage => {
  return page.type === PageType.Markdown;
};

export const isStoryPage = (page: Page): page is StoryPage => {
  return page.type === PageType.Story;
};
