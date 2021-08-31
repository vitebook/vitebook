import type { PageType } from '../PageType.js';
import type { BasePageData } from './BasePageData.js';

export type StoryPageData = BasePageData & {
  /**
   * Page type.
   */
  type: PageType.Story;

  /**
   * The name of the story.
   */
  name: string;

  /**
   * Story description.
   */
  description: string;

  /**
   * The component to load for this story.
   */
  component: string;
};
