import type { PageType } from '../PageType.js';
import type { StoryOptions } from '../StoryOptions.js';
import type { BasePageData } from './BasePageData.js';

export type StoryPageData = BasePageData &
  StoryOptions & {
    /**
     * Page type.
     */
    type: PageType.Story;
  };
