import type {
  StoryConfig,
  StoryOptions,
  StoryPage,
  StoryPageModule
} from '@vitebook/plugin-story/shared';
import type { Component } from 'vue';

export type VueStoryConfig = StoryConfig<Component>;
export type VueStoryOptions = StoryOptions<Component>;
export type VueStoryPage = StoryPage<Component>;
export type VueStoryPageModule = StoryPageModule<Component>;
