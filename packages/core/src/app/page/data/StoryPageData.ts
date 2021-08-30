import type { BasePageData } from './BasePageData.js';

export type StoryPageData = BasePageData & {
  /**
   * Page type.
   */
  type: 'story';

  /**
   * The component to load for this story.
   */
  component: string;
};
