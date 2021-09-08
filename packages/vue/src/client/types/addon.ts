import type {
  StoryAddon,
  StoryAddonModule,
  VirtualStoryAddonsModule
} from '@vitebook/plugin-story/shared';
import type { Component } from 'vue';

export type VueStoryAddon = StoryAddon<Component>;
export type VueStoryAddonModule = StoryAddonModule<Component>;
export type VueVirtualStoryAddonsModule =
  VirtualStoryAddonsModule<VueStoryAddonModule>;
