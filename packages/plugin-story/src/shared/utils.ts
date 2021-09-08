import type { Page } from '@vitebook/core/shared';

import type { StoryPage } from './page';

export function isStoryPage(page?: Page<unknown>): page is StoryPage {
  return page?.type === 'story';
}
