import type { LoadedMarkdownPage, MarkdownPage } from './MarkdownPage';
import type { LoadedSveltePage, SveltePage } from './SveltePage';

export type ClientPage = SveltePage | MarkdownPage;

export type LoadedClientPage = LoadedSveltePage | LoadedMarkdownPage;

export type VirtualClientPagesModule = {
  default: ClientPage[];
  [Symbol.toStringTag]: 'Module';
};
