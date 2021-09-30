import type {
  LoadedVueMarkdownPage,
  VueMarkdownPage
} from '@vitebook/plugin-markdown-vue/shared';

import { LoadedVueComponentPage, VueComponentPage } from './VueComponentPage';

export type Page = VueComponentPage | VueMarkdownPage;

export type LoadedPage = LoadedVueComponentPage | LoadedVueMarkdownPage;

export type VirtualPagesModule = {
  default: Page[];
};
