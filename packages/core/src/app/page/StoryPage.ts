import type { BasePage } from './BasePage.js';
import type { StoryPageData } from './data/StoryPageData.js';
import type { PageType } from './PageType.js';

export type StoryPage = BasePage<StoryPageData> & {
  /**
   * Page type.
   */
  type: PageType.Story;
};

export type StoryPageOptions = {
  type: PageType.Story;
  name?: string;
  description?: string;
  component?: string;
  content?: string;
  path?: string;
  filePath?: string;
};
