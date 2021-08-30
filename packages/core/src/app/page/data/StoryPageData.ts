import type { PageData } from './PageData.js';

export type StoryPageData = PageData & {
  /**
   * Page type.
   */
  type: 'story';

  /**
   * The component to load for this story.
   */
  component: string;
};
