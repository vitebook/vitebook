import type { Page as DefaultPage } from '@vitebook/core/shared';
import type {
  VueMarkdownPage,
  VueMarkdownPageModule
} from '@vitebook/plugin-markdown-vue/shared';
import type { Component } from 'vue';

import type { VueStoryPage, VueStoryPageModule } from '../types/story';

export type VueComponentPage = DefaultPage<Component>;

export type VuePage = VueComponentPage | VueMarkdownPage | VueStoryPage;

export type LoadedVueMarkdownPage = VueMarkdownPage & {
  data: VueMarkdownPageModule['data'];
};

export type LoadedVueStoryPage = VueStoryPage & {
  story: VueStoryPageModule['story'];
};

export type LoadedVuePage =
  | VueComponentPage
  | LoadedVueMarkdownPage
  | LoadedVueStoryPage;

export type VirtualVuePagesModule = {
  default: VuePage[];
};
