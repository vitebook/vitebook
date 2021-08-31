import matter from 'gray-matter';
import toml from 'toml';

import type { MarkdownPageFrontmatter } from '../data/MarkdownPageData.js';

/**
 * Resolve page content and raw frontmatter & excerpt.
 */
export const resolvePageContent = ({
  contentRaw
}: {
  contentRaw: string;
}): {
  content: string;
  frontmatterRaw: MarkdownPageFrontmatter;
  excerptRaw: string;
} => {
  if (!contentRaw) {
    return {
      content: '',
      frontmatterRaw: {},
      excerptRaw: ''
    };
  }

  const {
    data,
    content,
    excerpt = ''
  } = matter(contentRaw, {
    excerpt_separator: '<!-- more -->',
    engines: {
      toml: toml.parse.bind(toml)
    }
  });

  return {
    content,
    frontmatterRaw: data,
    excerptRaw: excerpt
  };
};
