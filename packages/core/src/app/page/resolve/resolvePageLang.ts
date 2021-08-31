import { isString } from '../../../utils/unit.js';
import type { App } from '../../App.js';
import type { MarkdownPageFrontmatter } from '../data/MarkdownPageData.js';

/**
 * Resolve the language of a page.
 */
export const resolvePageLang = ({
  app,
  frontmatter,
  pathLocale
}: {
  app: App;
  frontmatter: MarkdownPageFrontmatter;
  pathLocale: string;
}): string => {
  if (isString(frontmatter.lang) && frontmatter.lang) {
    return frontmatter.lang;
  }

  return app.site.options.locales[pathLocale]?.lang ?? app.site.options.lang;
};
