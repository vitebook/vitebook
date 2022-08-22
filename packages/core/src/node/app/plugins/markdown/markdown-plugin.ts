import { type Config as MarkdocConfig } from '@markdoc/markdoc';
import { createFilter, type FilterPattern } from '@rollup/pluginutils';
import { readFile } from 'fs/promises';
import { type Options as HastToHtmlConfig, toHtml } from 'hast-util-to-html';
import kleur from 'kleur';
import type { HighlighterOptions as ShikiConfig } from 'shiki';
import type { ViteDevServer } from 'vite';

import type { MarkdownMeta, ServerPage } from '../../../../shared';
import type { App } from '../../App';
import { invalidatePageModule } from '../pages/hmr';
import { type VitebookPlugin } from '../Plugin';
import { handleHMR } from './hmr';
import {
  clearMarkdownCache,
  type HighlightCodeBlock,
  parseMarkdown,
  type ParseMarkdownConfig,
  type ParseMarkdownResult,
} from './parse-markdown';

export function markdownPlugin(): VitebookPlugin {
  let app: App;
  let filter: (id: string) => boolean;
  let currentPage: ServerPage | undefined = undefined;
  let parse: (filePath: string, content: string) => ParseMarkdownResult;
  let highlight: HighlightCodeBlock | null = null;

  return {
    name: '@vitebook/markdown',
    enforce: 'pre',
    vitebook: {
      async configureApp(_app) {
        app = _app;

        const config = app.config.markdown;

        const {
          include,
          exclude,
          markdoc,
          nodes,
          hastToHtml,
          highlighter,
          ...parseOptions
        } = config;

        app.markdoc.base = markdoc;

        highlight = typeof highlighter === 'function' ? highlighter : null;

        parse = (filePath: string, content: string) =>
          parseMarkdown(app, filePath, content, {
            ignoreCache: false,
            filter,
            highlight: (code, lang) => highlight?.(code, lang),
            ...parseOptions,
          });

        filter = createFilter(include, exclude);

        if (highlighter === 'starry-night') {
          try {
            const mod = await import('@wooorm/starry-night');
            const starryNight = await mod.createStarryNight(mod.all);

            highlight = (code, lang) => {
              const scope = starryNight.flagToScope(lang);
              if (!scope) return '';
              const tree = starryNight.highlight(code, scope);
              return toHtml(tree, hastToHtml);
            };
          } catch (error) {
            app.logger.error(
              `Failed to import \`@wooorm/starry-night\`, is it installed?\n\n${
                (kleur.bold('npm install @wooorm/starry-night'), error)
              }`,
            );
          }
        }

        if (highlighter === 'shiki') {
          try {
            const mod = await import('shiki');
            const shiki = await mod.getHighlighter(config.shiki);
            const theme =
              (typeof config.shiki.theme === 'string'
                ? config.shiki.theme
                : config.shiki.theme?.name) ?? 'material-palenight';

            highlight = (code, lang) => {
              const tokens = shiki.codeToThemedTokens(code, lang);
              return mod.renderToHtml(tokens, {
                fg: shiki.getForegroundColor(theme),
                bg: shiki.getBackgroundColor(theme),
              });
            };
          } catch (error) {
            app.logger.error(
              `Failed to import \`shiki\`, is it installed?\n\n${
                (kleur.bold('npm install shiki'), error)
              }`,
            );
          }
        }

        await app.markdoc.configure({
          include: nodes.include,
          exclude: nodes.exclude,
          dirs: {
            root: app.dirs.root.path,
            pages: app.dirs.pages.path,
          },
        });

        await app.markdoc.discover();
      },
    },
    configResolved(config) {
      app.markdoc.vite = {
        mode: app.vite.env.mode,
        env: config.env ?? {},
      };
    },
    async configureServer(server) {
      handleHMR({ pages: app.pages, markdoc: app.markdoc, server });

      server.ws.on('vitebook::page_change', ({ rootPath }) => {
        const filePath = app.dirs.root.resolve(rootPath);
        currentPage = app.pages.getPage(filePath);
      });
    },
    transform(content, id) {
      if (filter(id)) {
        const { output } = parse(id, content);
        return output;
      }

      return null;
    },
    async handleHotUpdate(ctx) {
      const { file, server, read } = ctx;

      if (filter(file)) {
        const content = await read();

        const layoutIndex = app.pages.getLayoutIndex(file);
        const isLayoutFile = layoutIndex >= 0;

        if (isLayoutFile && currentPage?.layouts.includes(layoutIndex)) {
          clearMarkdownCache(currentPage.filePath);
          invalidatePageModule(server, currentPage);

          const { meta } = parse(
            currentPage.filePath,
            await readFile(currentPage.filePath, { encoding: 'utf-8' }),
          );

          handleMetaHMR(server, currentPage.filePath, meta);
        }

        const { output, meta } = parse(file, content);
        ctx.read = () => output;

        if (!isLayoutFile) handleMetaHMR(server, file, meta);
      }
    },
  };
}

function handleMetaHMR(
  server: ViteDevServer,
  filePath: string,
  meta: MarkdownMeta,
) {
  server.ws.send({
    type: 'custom',
    event: 'vitebook::md_meta',
    data: { filePath, meta },
  });
}

export type ResolvedMarkdownPluginConfig = {
  /**
   * Filter files to be processed as Markdown files.
   */
  include: FilterPattern;
  /**
   * Filter files to be excluded from Markdown processing.
   */
  exclude: FilterPattern;
  /**
   * Markdoc configuration options.
   */
  markdoc: MarkdocConfig;
  /**
   * Markdoc nodes configuration.
   */
  nodes: {
    /**
     * Globs pointing at files which should be included as Markdoc nodes/tags.
     */
    include: string[];
    /**
     * Globs or RegExp indicating node files which should be excluded from being Markdoc nodes/tags.
     */
    exclude: (string | RegExp)[];
  };
  /**
   * Syntax highlighter configuration.
   *
   * - In order to use Shiki please install it `npm install shiki`.
   * - In order to use Starry Night please install it `npm install @woorm/starry-night`.
   *
   * @see {@link https://github.com/shikijs/shiki}
   * @see {@link https://github.com/wooorm/starry-night}
   */
  highlighter: 'shiki' | 'starry-night' | HighlightCodeBlock | false;
  /**
   * Shiki configuration options.
   */
  shiki: ShikiConfig;
  /**
   * HAST to HTML transformer configuration. The tree returned from `starry-night` is a HAST
   * tree so it needs to be transformed to HTML - you can configure it here.
   *
   * @see {@link https://github.com/wooorm/starry-night}
   * @see {@link https://github.com/syntax-tree/hast-util-to-html}
   */
  hastToHtml: HastToHtmlConfig;
  /**
   * Markdoc AST transformers.
   */
  transformAst: ParseMarkdownConfig['transformAst'];
  /**
   * Called for each render node in the Markdoc renderable tree. This function can be used to
   * transform the tree before it's rendered.
   */
  transformTreeNode: ParseMarkdownConfig['transformTreeNode'];
  /**
   * Markdoc renderable tree transformers (_after_ AST is transformed into render tree).
   */
  transformContent: ParseMarkdownConfig['transformContent'];
  /**
   * Markdown meta transformers (_before_ content is rendered).
   */
  transformMeta: ParseMarkdownConfig['transformMeta'];
  /**
   * Rendered Markdown output transformers.
   */
  transformOutput: ParseMarkdownConfig['transformOutput'];
  /**
   * Custom Markdoc renderer which takes render tree and produces final output.
   */
  render?: ParseMarkdownConfig['render'];
};

export type MarkdownPluginConfig = Partial<ResolvedMarkdownPluginConfig>;
