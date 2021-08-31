import type { MarkdownLink } from '../markdown/Markdown.js';
import type { BasePage } from './BasePage.js';
import type {
  MarkdownPageData,
  MarkdownPageFrontmatter
} from './data/MarkdownPageData.js';
import type { PageType } from './PageType.js';

export type MarkdownPage = BasePage<MarkdownPageData> & {
  /**
   * Page type.
   */
  type: PageType.Markdown;

  /**
   * Rendered content of the page.
   */
  contentRendered: string;

  /**
   * Date of the page, in 'yyyy-MM-dd' format.
   *
   * @example '2020-09-09'
   */
  date: string;

  /**
   * Dependencies of the page.
   */
  deps: string[];

  /**
   * Hoisted tags of the page.
   */
  hoistedTags: string[];

  /**
   * Links of the page.
   */
  links: MarkdownLink[];
};

/**
 * Options to create markdown page.
 */
export type MarkdownPageOptions = {
  type: PageType.Markdown;
  content?: string;
  path?: string;
  filePath?: string;
  frontmatter?: MarkdownPageFrontmatter;
};
