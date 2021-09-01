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
  /**
   * Page type.
   */
  type: PageType.Markdown;
  /**
   * If `filePath` is not set, this option will be used as the raw
   * markdown content of the page.
   *
   * If `filePath` is set, this option will be ignored, while the
   * content of the file will be used.
   */
  content?: string;

  /**
   * If this option is set, it will be used as the final route path
   * of the page, ignoring the relative path and permalink.
   */
  path?: string;

  /**
   * Absolute file path of the markdown source file.
   */
  filePath?: string;

  /**
   * Default frontmatter of the page, which could be overridden by
   * the frontmatter of the markdown content.
   */

  frontmatter?: MarkdownPageFrontmatter;
};
