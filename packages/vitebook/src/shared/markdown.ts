export type MarkdownMeta = {
  title?: string | null;
  headings: MarkdownHeading[];
  frontmatter: MarkdownFrontmatter;
  lastUpdated: number;
};

export type MarkdownFrontmatter = Record<string, any>;

export type MarkdownHeading = {
  level: number;
  title: string;
  id: string;
};

export type MarkdownModule = {
  __markdownMeta: MarkdownMeta;
};
