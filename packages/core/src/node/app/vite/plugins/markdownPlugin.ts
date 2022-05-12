import { type MarkdownFrontmatter } from '../../../../shared';
import { type App } from '../../App';
import { createMarkdownParser } from '../../markdown/createMarkdownParser';
import { parseMarkdownToSvelte } from '../../markdown/parseMarkdownToSvelte';
import type {
  ComponentTopLevelTag,
  MarkdownParser,
  MarkdownParserOptions,
} from '../../markdown/types';
import { type Plugin } from '../../plugin/Plugin';

export type MarkdownPluginOptions = MarkdownParserOptions & {
  /**
   * Hook to add top-level tags to the rendered Svelte component.
   *
   * @example
   * ```
   * topLevelTags() {
   *   return [{ scope: 'module', content: 'import Something from '...';', }]
   * }
   * ```
   */
  topLevelTags?: (data: {
    file: string;
  }) => ComponentTopLevelTag[] | Promise<ComponentTopLevelTag[]>;

  /**
   * Hook to transform the rendered Svelte component before it's returned.
   */
  transform?: (data: {
    file: string;
    frontmatter: MarkdownFrontmatter;
    component: string;
  }) => string | Promise<string>;
};

const DEFAULT_INCLUDE_RE = /\.md($|\?)/;

export function markdownPlugin(options: MarkdownPluginOptions = {}): Plugin {
  let app: App;
  let parser: MarkdownParser;

  const {
    transform: transformComponent,
    topLevelTags,
    ...parserOptions
  } = options;

  /** Page system file paths. */
  const files = new Set<string>();

  const parseToSvelte = async (file: string, content: string) => {
    const {
      component,
      meta: { frontmatter },
    } = parseMarkdownToSvelte(app, parser, content, file, {
      topLevelTags: await topLevelTags?.({ file }),
    });

    return (
      transformComponent?.({
        file,
        frontmatter,
        component,
      }) ?? component
    );
  };

  return {
    name: '@vitebook/core:markdown',
    enforce: 'pre',
    async configureApp(_app) {
      app = _app;
      parser = await createMarkdownParser(parserOptions);
      for (const plugin of app.plugins) {
        await plugin.configureMarkdownParser?.(parser);
      }
    },
    async resolvePage({ filePath }) {
      const res = DEFAULT_INCLUDE_RE.test(filePath) ? { type: 'md' } : null;
      if (res) files.add(filePath);
      return res;
    },
    pagesRemoved(pages) {
      pages.forEach((page) => {
        files.delete(page.filePath);
      });
    },
    transform(content, id) {
      if (files.has(id)) {
        return parseToSvelte(id, content);
      }

      return null;
    },
    async handleHotUpdate(ctx) {
      const { file, read } = ctx;

      // Hot reload `.md` files as `.svelte` files.
      if (files.has(file)) {
        const content = await read();
        const component = await parseToSvelte(file, content);
        ctx.read = () => component;
      }
    },
  };
}
