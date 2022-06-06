import { type Config as MarkdocConfig } from '@markdoc/markdoc';
import { createFilter, type FilterPattern } from '@rollup/pluginutils';
import { readFile } from 'fs/promises';
import { type Options as HastToHtmlConfig, toHtml } from 'hast-util-to-html';
import kleur from 'kleur';
import type { HighlighterOptions as ShikiConfig } from 'shiki';
import { logger } from 'src/node/utils';
import type { ViteDevServer } from 'vite';

import type { MarkdownMeta, ServerPage } from '../../../../shared';
import type { App } from '../../App';
import { invalidatePageModule } from '../pages/hmr';
import { type Plugin } from '../Plugin';
import { handleHMR } from './hmr';
import {
  clearMarkdownCache,
  type HighlightCodeBlock,
  parseMarkdown,
  type ParseMarkdownConfig,
} from './parseMarkdown';

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
   * Rendered Markdown output transformers.
   */
  transformOutput: ParseMarkdownConfig['transformOutput'];
  /**
   * Custom Markdoc renderer which takes render tree and produces final output.
   */
  render?: ParseMarkdownConfig['render'];
};

export type MarkdownPluginConfig = Partial<ResolvedMarkdownPluginConfig>;

export function markdownPlugin(config: ResolvedMarkdownPluginConfig): Plugin {
  let app: App;
  let filter: (id: string) => boolean;
  let currentPage: ServerPage | undefined = undefined;

  const {
    include,
    exclude,
    markdoc,
    highlighter,
    nodes,
    hastToHtml,
    ...parseOptions
  } = config;

  let highlight: HighlightCodeBlock | null =
    typeof highlighter === 'function' ? highlighter : null;

  const parse = (filePath: string, content: string) =>
    parseMarkdown(app, filePath, content, {
      ignoreCache: false,
      filter,
      highlight: (code, lang) => highlight?.(code, lang),
      ...parseOptions,
    });

  return {
    name: '@vitebook/markdown',
    enforce: 'pre',
    async vitebookInit(_app) {
      app = _app;

      app.markdoc.base = markdoc;

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
        } catch (e) {
          logger.error(
            logger.formatErrorMsg(
              `Failed to import \`@wooorm/starry-night\`, is it installed?\n\n${
                (kleur.bold('npm install @wooorm/starry-night'), `\n\n${e}`)
              }`,
            ),
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
        } catch (e) {
          logger.error(
            logger.formatErrorMsg(
              `Failed to import \`shiki\`, is it installed?\n\n${
                (kleur.bold('npm install shiki'), `\n\n${e}`)
              }`,
            ),
          );
        }
      }

      await app.markdoc.init({
        include: nodes.include,
        exclude: nodes.exclude,
        dirs: {
          root: app.dirs.root.path,
          pages: app.dirs.pages.path,
        },
      });
    },
    configResolved({ mode, env }) {
      app.markdoc.vite = { mode, env };
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

          const { output: _, ...meta } = parse(
            currentPage.filePath,
            await readFile(currentPage.filePath, { encoding: 'utf-8' }),
          );

          handleMetaHMR(server, meta);
        }

        const { output, ...meta } = parse(file, content);
        ctx.read = () => output;

        if (!isLayoutFile) handleMetaHMR(server, meta);
      }
    },
  };
}

function handleMetaHMR(server: ViteDevServer, meta: MarkdownMeta) {
  server.ws.send({
    type: 'custom',
    event: 'vitebook::md_meta',
    data: meta,
  });
}
