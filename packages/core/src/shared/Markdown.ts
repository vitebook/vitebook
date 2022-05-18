export type MarkdownMeta = {
  title: string | null;
  headings: MarkdownHeading[];
  frontmatter: MarkdownFrontmatter;
  lastUpdated: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MarkdownFrontmatter = Record<string, any>;

export type MarkdownHeading = {
  level: number;
  title: string;
  id: string;
};
