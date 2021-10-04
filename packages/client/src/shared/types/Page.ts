import type { LoadedMarkdownPage, MarkdownPage } from './MarkdownPage';
import type {
  LoadedVueComponentPage,
  VueComponentPage
} from './VueComponentPage';

export type Page = VueComponentPage | MarkdownPage;

export type LoadedPage = LoadedVueComponentPage | LoadedMarkdownPage;

export type VirtualPagesModule = {
  default: Page[];
};
