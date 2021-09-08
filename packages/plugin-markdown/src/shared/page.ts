import type {
  HeadConfig,
  Page,
  ResolvedPage,
  ServerPage
} from '@vitebook/core/shared';

export type MarkdownPage = Page<MarkdownPageModule> & {
  type: 'md';
};

export type MarkdownPageModule<Data extends MarkdownData = MarkdownData> = {
  /** Parsed HTML template from markdown file. */
  default: string;
  data: Data;
};

export type ServerMarkdownPage = ServerPage & {
  type: 'md';
};

export type ResolvedMarkdownPage = ResolvedPage & {
  type: 'md';
};

export type MarkdownData = {
  excerpt: string;
  frontmatter: MarkdownFrontmatter;
  headers: MarkdownHeader[];
  title: string;
};

export type MarkdownFrontmatter = Record<string, unknown> & {
  date?: string | Date;
  description?: string;
  head?: HeadConfig[];
  title?: string;
  // TODO: add support for these later.
  // layout?: string;
  // permalink?: string;
  // permalinkPattern?: string;
};

export type MarkdownHeader = {
  level: number;
  title: string;
  slug: string;
  children: MarkdownHeader[];
};

export type MarkdownLinks = string[];
