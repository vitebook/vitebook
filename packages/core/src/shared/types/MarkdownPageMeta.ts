import type { PageMeta } from './PageMeta';

export type MarkdownPageMeta = PageMeta & {
  title: string;
  excerpt: string;
  headers: MarkdownHeader[];
  frontmatter: MarkdownFrontmatter;
  lastUpdated: number;
};

export type MarkdownFrontmatter = Record<string, unknown>;

export type MarkdownHeader = {
  level: number;
  title: string;
  slug: string;
  children: MarkdownHeader[];
};

export type MarkdownLinks = string[];
