import type { BasePage } from './BasePage.js';
import type { StoryPageData } from './data/StoryPageData.js';
import type { PageType } from './PageType.js';
import type { StoryOptions } from './StoryOptions.js';

export type StoryPage = BasePage<StoryPageData> & {
  /**
   * Page type.
   */
  type: PageType.Story;
};

export type StoryPageOptions = Partial<StoryOptions> & {
  type: PageType.Story;
  path?: string;
  filePath?: string;
};
