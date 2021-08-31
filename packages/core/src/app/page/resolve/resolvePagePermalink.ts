import { ensureLeadingSlash, path } from '../../../utils/path.js';
import { isString } from '../../../utils/unit.js';
import type { MarkdownPageFrontmatter } from '../data/MarkdownPageData.js';

/**
 * Resolve page permalink from frontmatter/options/pattern.
 */
export const resolvePagePermalink = ({
  frontmatter,
  slug,
  date,
  pathInferred,
  pathLocale
}: {
  frontmatter: MarkdownPageFrontmatter;
  slug: string;
  date: string;
  pathInferred: string | null;
  pathLocale: string;
}): string | null => {
  // Use permalink in frontmatter directly.
  if (isString(frontmatter.permalink)) {
    return frontmatter.permalink;
  }

  // Get permalink pattern from frontmatter or options.
  const pattern = isString(frontmatter.permalinkPattern)
    ? frontmatter.permalinkPattern
    : null;

  if (!pattern) {
    return null;
  }

  // resolve permalink according to the pattern
  const [year, month, day] = date.split('-');

  const link = path.join(
    pathLocale,
    pattern
      .replace(/:year/, year)
      .replace(/:month/, month)
      .replace(/:day/, day)
      .replace(/:slug/, slug)
      .replace(/:raw/, pathInferred?.replace(/^\//, '') ?? '')
  );

  return ensureLeadingSlash(link);
};
