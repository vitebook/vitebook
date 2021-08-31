import type { MarkdownPageFrontmatter } from '../data/MarkdownPageData.js';
import type { MarkdownPageOptions } from '../MarkdownPage.js';

/**
 * Resolve page frontmatter from user frontmatter and options frontmatter
 */
export const resolvePageFrontmatter = ({
  frontmatterRaw,
  options
}: {
  frontmatterRaw: MarkdownPageFrontmatter;
  options: MarkdownPageOptions;
}): MarkdownPageFrontmatter => ({
  // raw frontmatter take priority over options frontmatter
  ...options.frontmatter,
  ...frontmatterRaw
});
