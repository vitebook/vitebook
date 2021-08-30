import type { BasePage } from './BasePage.js';
import type { StoryPageData } from './data/StoryPageData.js';

export type StoryPage = BasePage<StoryPageData> & {
  /**
   * Page type.
   */
  type: 'story';
};

export type CreateStoryPageOptions = {
  path?: string;
  filePath?: string;
};
