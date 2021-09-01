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
  /**
   * Page type.
   */
  type: PageType.Story;
  /**
   * If this option is set, it will be used as the final route path
   * of the page.
   */
  path?: string;
  /**
   * Absolute file path of the markdown source file.
   */
  filePath?: string;
};
