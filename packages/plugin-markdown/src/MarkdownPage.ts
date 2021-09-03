import type {
  DefaultPageComponentModule,
  Page,
  ResolvedPage,
  ServerPage
} from '@vitebook/core';

import type {
  MarkdownFrontmatter,
  MarkdownHeader,
  MarkdownLink
} from './Markdown.js';

export type MarkdownPage<ComponentModule = DefaultPageComponentModule> = Page<
  ComponentModule,
  { default: MarkdownPageData }
> & {
  type: 'md';
};

export type ServerMarkdownPage = ServerPage & {
  type: 'md';
  meta: MarkdownPageMeta;
};

export type ResolvedMarkdownPage = ResolvedPage & {
  type: 'md';
  meta: MarkdownPageMeta;
};

export type MarkdownPageMeta<Data extends MarkdownPageData = MarkdownPageData> =
  {
    text: string;
    data: Data;
    date: string;
    deps: string[];
    html: string;
    links: MarkdownLink[];
    permalink: string;
    slug: string;
  };

export type MarkdownPageData = {
  excerpt: string;
  frontmatter: MarkdownFrontmatter;
  headers: MarkdownHeader[];
  lang: string;
  title: string;
};
