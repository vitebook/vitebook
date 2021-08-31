import type { App } from '../../App.js';
import type { MarkdownEnv } from '../../markdown/Markdown.js';
import type { MarkdownPageFrontmatter } from '../data/MarkdownPageData.js';

/**
 * Render markdown page excerpt from raw excerpt.
 */
export const renderMarkdownPageExcerpt = ({
  app,
  excerptRaw,
  frontmatter,
  filePath,
  filePathRelative
}: {
  app: App;
  excerptRaw: string;
  frontmatter: MarkdownPageFrontmatter;
  filePath: string | null;
  filePathRelative: string | null;
}): string => {
  const markdownEnv: MarkdownEnv = {
    baseUrl: app.site.options.baseUrl,
    filePath,
    filePathRelative,
    frontmatter
  };
  const renderedExcerpt = app.markdown.parser.render(excerptRaw, markdownEnv);
  return renderedExcerpt;
};
