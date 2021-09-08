import type { Page, ResolvedPage, ServerPage } from '@vitebook/core/shared';

import type { StoryConfig } from './story';

export type StoryPage<Component = unknown> = Page<
  StoryPageModule<Component>
> & {
  type: 'story';
};

export type StoryPageModule<Component = unknown> = {
  default: Component | StoryConfig<Component>;
  story?: StoryConfig<Component>;
};

export type ServerStoryPage = ServerPage & {
  type: 'story';
};

export type ResolvedStoryPage = ResolvedPage & {
  type: 'story';
};
