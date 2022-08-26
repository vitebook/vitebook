import { isLoadedMarkdownPage, type MarkdownMeta } from '../../shared';
import { type PageStore } from './page';
import { derived } from './store';
import { type ReadableStore } from './types';

export type MarkdownStore = ReadableStore<MarkdownMeta | undefined>;

export type FrontmatterStore = ReadableStore<MarkdownMeta['frontmatter']>;

export const createMarkdownStore = (page: PageStore): MarkdownStore =>
  derived(page, ($page) =>
    isLoadedMarkdownPage($page) ? $page.meta : undefined,
  );

export const createFrontmatterStore = (
  markdown: MarkdownStore,
): FrontmatterStore => derived(markdown, ($meta) => $meta?.frontmatter ?? {});
