import type { LoadedMarkdownPage, MarkdownPage } from './MarkdownPage';
import type {
  LoadedVueComponentPage,
  VueComponentPage
} from './VueComponentPage';

export type ClientPage = VueComponentPage | MarkdownPage;

export type LoadedClientPage = LoadedVueComponentPage | LoadedMarkdownPage;

export type VirtualClientPagesModule = {
  default: ClientPage[];
};
