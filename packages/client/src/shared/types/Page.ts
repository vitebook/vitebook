import type {
  VueMarkdownPage,
  VueMarkdownPageModule
} from '@vitebook/plugin-markdown-vue/shared';

import { VueComponentPage, VueComponentPageModule } from './VueComponentPage';

export type Page = VueComponentPage | VueMarkdownPage;

export type LoadedVueMarkdownPage = VueMarkdownPage & {
  meta: VueMarkdownPageModule['__pageMeta'];
};

export type LoadedVueComponentPage = VueComponentPage & {
  meta: VueComponentPageModule['__pageMeta'];
};

export type LoadedPage = LoadedVueComponentPage | LoadedVueMarkdownPage;

export type VirtualPagesModule = {
  default: Page[];
};
