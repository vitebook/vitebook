/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { App } from '../App.js';
import type { MarkdownPage } from './MarkdownPage.js';
import type { Page, PageOptions } from './Page.js';
import { PageType } from './PageType.js';
import { renderMarkdownPageContent } from './render/renderMarkdownPageContent.js';
import { renderMarkdownPageExcerpt } from './render/renderMarkdownPageExcerpt.js';
import { inferPagePath } from './resolve/inferPagePath.js';
import { resolveMarkdownPageData } from './resolve/resolveMarkdownPageData.js';
import { resolveMarkdownPageOptions } from './resolve/resolveMarkdownPageOptions.js';
import { resolvePageComponentFileInfo } from './resolve/resolvePageComponentFileInfo.js';
import { resolvePageContent } from './resolve/resolvePageContent.js';
import { resolvePageDataInfo } from './resolve/resolvePageDataInfo.js';
import { resolvePageDate } from './resolve/resolvePageDate.js';
import { resolvePageFileContent } from './resolve/resolvePageFileContent.js';
import { resolvePageFilePath } from './resolve/resolvePageFilePath.js';
import { resolvePageFrontmatter } from './resolve/resolvePageFrontmatter.js';
import { resolvePageHtmlInfo } from './resolve/resolvePageHtmlInfo.js';
import { resolvePageKey } from './resolve/resolvePageKey.js';
import { resolvePageLang } from './resolve/resolvePageLang.js';
import { resolvePagePath } from './resolve/resolvePagePath.js';
import { resolvePagePermalink } from './resolve/resolvePagePermalink';
import { resolvePageSlug } from './resolve/resolvePageSlug.js';
import { resolveStoryPageData } from './resolve/resolveStoryPageData.js';
import { resolveStoryPageOptions } from './resolve/resolveStoryPageOptions.js';
import type { StoryOptions } from './StoryOptions.js';
import type { StoryPage } from './StoryPage.js';

export const createPage = async (
  app: App,
  optionsRaw: PageOptions
): Promise<Page> => {
  // Resolve page options from raw options.
  const options =
    optionsRaw.type === PageType.Markdown
      ? await resolveMarkdownPageOptions({ app, optionsRaw })
      : await resolveStoryPageOptions({ app, optionsRaw });

  // Page type.
  const pageType = options.type;
  const isMarkdownPage = pageType === PageType.Markdown;

  // Resolve page file absolute path and relative path.
  const { filePath, filePathRelative } = resolvePageFilePath({
    app,
    options
  });

  // Read the raw file content according to the absolute file path.
  const contentRaw = await resolvePageFileContent({ filePath, options });

  // Resolve content & frontmatter & raw excerpt from raw content.
  const {
    content: markdownContent = null,
    frontmatterRaw = null,
    excerptRaw = null
  } = isMarkdownPage
    ? resolvePageContent({
        contentRaw
      })
    : {};

  // Resolve frontmatter from raw frontmatter and page options.
  const frontmatter = isMarkdownPage
    ? resolvePageFrontmatter({ frontmatterRaw: frontmatterRaw!, options })
    : {};

  // Render page content and extract information.
  const {
    contentRendered = null,
    deps = null,
    headers = null,
    hoistedTags = null,
    links = null,
    title = null
  } = isMarkdownPage
    ? await renderMarkdownPageContent({
        app,
        content: markdownContent!,
        filePath,
        filePathRelative,
        frontmatter
      })
    : {};

  // Render excerpt.
  const excerpt = isMarkdownPage
    ? renderMarkdownPageExcerpt({
        app,
        excerptRaw: excerptRaw!,
        filePath,
        filePathRelative,
        frontmatter
      })
    : null;

  // Resolve slug from file path.
  const slug = resolvePageSlug({ filePathRelative });

  // Infer page path according to file path.
  const { pathInferred, pathLocale } = inferPagePath({ app, filePathRelative });

  // Resolve language from frontmatter and site options.
  const lang = resolvePageLang({ app, frontmatter, pathLocale });

  // Resolve date from file path.
  const date = resolvePageDate({ frontmatter, filePathRelative });

  // Resolve page permalink.
  const permalink = resolvePagePermalink({
    frontmatter,
    slug,
    date,
    pathInferred,
    pathLocale
  });

  // Resolve page path.
  const path = resolvePagePath({ permalink, pathInferred, options });

  // Resolve path key.
  const key = resolvePageKey({ path });

  // Resolve page rendered html file path.
  const { htmlFilePath, htmlFilePathRelative } = resolvePageHtmlInfo({
    app,
    path
  });

  // Resolve page component and extract headers & links.
  const { componentFilePath, componentFilePathRelative } =
    await resolvePageComponentFileInfo({
      app,
      htmlFilePathRelative
    });

  const { dataFilePath, dataFilePathRelative } = resolvePageDataInfo({
    app,
    htmlFilePathRelative
  });

  const basePage = {
    key,
    path,
    lang,
    content: isMarkdownPage ? markdownContent! : contentRaw,
    pathInferred,
    pathLocale,
    permalink,
    slug,
    filePath,
    filePathRelative,
    componentFilePath,
    componentFilePathRelative,
    dataFilePath,
    dataFilePathRelative,
    htmlFilePath,
    htmlFilePathRelative
  };

  if (options.type === PageType.Markdown) {
    const page: Omit<MarkdownPage, 'data'> = {
      ...basePage,
      type: options.type,
      title: title!,
      frontmatter,
      excerpt: excerpt!,
      headers: headers!,
      contentRendered: contentRendered!,
      date,
      deps: deps!,
      hoistedTags: hoistedTags!,
      links: links!
    };

    const data = await resolveMarkdownPageData({ app, page });

    return {
      ...page,
      data
    };
  } else {
    const page: Omit<StoryPage, 'data'> = {
      title: '', // Overriden by options spread 1 line down. Used to silence error.
      ...(options as StoryOptions),
      ...basePage,
      type: options.type
    };

    const data = await resolveStoryPageData({ app, page });

    return {
      ...page,
      data
    };
  }
};
