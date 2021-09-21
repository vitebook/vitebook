import type { Page, PageMeta } from '@vitebook/core/shared';

export type MarkdownPage = Page<MarkdownPageModule> & {
  type: 'md';
};

export type MarkdownPageModule<
  Meta extends MarkdownPageMeta = MarkdownPageMeta
> = {
  /** Parsed HTML template from markdown file. */
  default: string;
  __pageMeta: Meta;
};

export type MarkdownPageMeta = PageMeta & {
  title: string;
  excerpt: string;
  headers: MarkdownHeader[];
  frontmatter: MarkdownFrontmatter;
};

export type MarkdownFrontmatter = Record<string, unknown>;

export type MarkdownHeader = {
  level: number;
  title: string;
  slug: string;
  children: MarkdownHeader[];
};

export type MarkdownLinks = string[];
