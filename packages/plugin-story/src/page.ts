import type { Page, ResolvedPage, ServerPage } from '@vitebook/core';

import type { StoryConfig } from './story.js';

export type StoryPage<Component = unknown> = Page<
  StoryPageModule<Component>
> & {
  type: 'story';
};

export type StoryPageModule<Component = unknown> = {
  default: Component | StoryConfig<Component>;
  story?: StoryConfig<Component>;
} & Record<string, StoryConfig<Component> | undefined>;

export type ServerStoryPage = ServerPage & {
  type: 'story';
};

export type ResolvedStoryPage = ResolvedPage & {
  type: 'story';
};
