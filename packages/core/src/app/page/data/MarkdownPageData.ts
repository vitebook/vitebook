import type { HeadConfig } from '../../site/HeadConfig.js';
import type { PageData } from './PageData.js';

export type MarkdownPageData = PageData & {
  /**
   * Page type.
   */
  type: 'markdown';

  /**
   * Frontmatter of the page.
   */
  frontmatter: MarkdownPageFrontmatter;

  /**
   * Headers of the page.
   */
  headers: MarkdownPageHeader[];
};

export type MarkdownPageFrontmatter = {
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
