import type { MarkdownLink } from '../markdown/Markdown.js';
import type { BasePage } from './BasePage.js';
import type {
  MarkdownPageData,
  MarkdownPageFrontmatter
} from './data/MarkdownPageData.js';

export type MarkdownPage = BasePage<MarkdownPageData> & {
  /**
   * Page type.
   */
  type: 'markdown';

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
export type CreateMarkdownPageOptions = {
  path?: string;
  filePath?: string;
  frontmatter?: MarkdownPageFrontmatter;
  content?: string;
};
