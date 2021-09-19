import type {
  StoryAddon,
  StoryAddonModule,
  VirtualStoryAddonsModule as BaseVirtualStoryAddonsModule
} from '@vitebook/plugin-story/shared';
import type { Component } from 'vue';

export type VueStoryAddon = StoryAddon<Component>;
export type VueStoryAddonModule = StoryAddonModule<Component>;
export type VirtualStoryAddonsModule =
  BaseVirtualStoryAddonsModule<VueStoryAddonModule>;
