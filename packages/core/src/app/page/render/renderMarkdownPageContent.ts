import type { App } from '../../App.js';
import type {
  MarkdownEnv,
  MarkdownHeader,
  MarkdownLink
} from '../../markdown/Markdown.js';
import type { MarkdownPageFrontmatter } from '../data/MarkdownPageData.js';

/**
 * Render markdown page content and extract related info.
 */
export const renderMarkdownPageContent = async ({
  app,
  content,
  frontmatter,
  filePath,
  filePathRelative
}: {
  app: App;
  content: string;
  frontmatter: MarkdownPageFrontmatter;
  filePath: string | null;
  filePathRelative: string | null;
}): Promise<{
  contentRendered: string;
  deps: string[];
  headers: MarkdownHeader[];
  hoistedTags: string[];
  links: MarkdownLink[];
  title: string;
}> => {
  const markdownEnv: MarkdownEnv = {
    baseUrl: app.site.options.baseUrl,
    filePath,
    filePathRelative,
    frontmatter
  };

  const contentRendered = app.markdown.parser.render(content, markdownEnv);

  const {
    headers = [],
    hoistedTags = [],
    importedFiles = [],
    links = [],
    title = ''
  } = markdownEnv;

  return {
    contentRendered,
    deps: importedFiles,
    headers,
    hoistedTags,
    links,
    title
  };
};
