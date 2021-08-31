import type { HeadConfig } from '../../site/HeadConfig.js';
import type { PageType } from '../PageType.js';
import type { BasePageData } from './BasePageData.js';

export type MarkdownPageData = BasePageData & {
  /**
   * Excerpt of the page.
   */
  excerpt: string;

  /**
   * Page type.
   */
  type: PageType.Markdown;

  /**
   * Frontmatter of the page.
   */
  frontmatter: MarkdownPageFrontmatter;

  /**
   * Headers of the page.
   */
  headers: MarkdownPageHeader[];
};

export type MarkdownPageFrontmatter<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<any, any> = Record<string, unknown>
> = Partial<T> & {
  date?: string | Date;
  description?: string;
  head?: HeadConfig[];
  lang?: string;
  layout?: string;
  permalink?: string;
  permalinkPattern?: string;
  title?: string;
};

export type MarkdownPageHeader = {
  level: number;
  title: string;
  slug: string;
  children: MarkdownPageHeader[];
};
