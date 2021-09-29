import type { PageMeta } from '@vitebook/core/shared';
import type { MarkdownPageMeta } from '@vitebook/plugin-markdown/shared';
import type { VueMarkdownPage } from '@vitebook/plugin-markdown-vue/shared';

import { VueComponentPage } from './VueComponentPage';

export type Page = VueComponentPage | VueMarkdownPage;

export type LoadedVueMarkdownPage = VueMarkdownPage & {
  meta: MarkdownPageMeta;
};

export type LoadedVueComponentPage = VueComponentPage & {
  meta: PageMeta;
};

export type LoadedPage = LoadedVueComponentPage | LoadedVueMarkdownPage;

export type VirtualPagesModule = {
  default: Page[];
};
