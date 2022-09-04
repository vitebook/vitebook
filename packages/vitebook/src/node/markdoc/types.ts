import type { Node, RenderableTreeNode } from '@markdoc/markdoc';
import type {
  MarkdownFrontmatter,
  MarkdownHeading,
  MarkdownMeta,
} from 'shared/markdown';

export type HighlightCodeBlock = (
  code: string,
  lang: string,
) => string | undefined | null;

export type MarkdocTreeWalkStuff = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [id: string]: any;
  baseUrl: string;
  filePath: string;
  appDir: string;
  links: Set<string>;
  imports: Set<string>;
  headings: MarkdownHeading[];
  highlight: HighlightCodeBlock;
};

export type MarkdocTreeNodeTransformer = (data: {
  node: RenderableTreeNode;
  stuff: MarkdocTreeWalkStuff;
}) => void;

export type MarkdocAstTransformer = (data: {
  ast: Node;
  filePath: string;
  source: string;
}) => void;

export type MarkdocContentTransformer = (data: {
  filePath: string;
  content: RenderableTreeNode;
  frontmatter: MarkdownFrontmatter;
}) => string;

export type MarkdocMetaTransformer = (data: {
  filePath: string;
  imports: string[];
  stuff: MarkdocTreeWalkStuff;
  meta: MarkdownMeta;
}) => void;

export type MarkdocOutputTransformer = (data: {
  filePath: string;
  code: string;
  imports: string[];
  stuff: MarkdocTreeWalkStuff;
  meta: MarkdownMeta;
}) => string;

export type MarkdocRenderer = (data: {
  filePath: string;
  content: RenderableTreeNode;
  imports: string[];
  stuff: MarkdocTreeWalkStuff;
  meta: MarkdownMeta;
}) => string;

export type ParseMarkdownConfig = {
  ignoreCache?: boolean;
  filter: (id: string) => boolean;
  highlight: HighlightCodeBlock;
  transformAst: MarkdocAstTransformer[];
  transformTreeNode: MarkdocTreeNodeTransformer[];
  transformContent: MarkdocContentTransformer[];
  transformMeta: MarkdocMetaTransformer[];
  transformOutput: MarkdocOutputTransformer[];
  render: MarkdocRenderer;
};

export type ParseMarkdownResult = {
  filePath: string;
  output: string;
  meta: MarkdownMeta;
  ast: Node;
  stuff: MarkdocTreeWalkStuff;
  content: RenderableTreeNode;
};
