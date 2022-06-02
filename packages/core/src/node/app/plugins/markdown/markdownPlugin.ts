import { type Config as MarkdocConfig } from '@markdoc/markdoc';
import { createFilter, type FilterPattern } from '@rollup/pluginutils';
import { type Options as HastToHtmlConfig, toHtml } from 'hast-util-to-html';
import kleur from 'kleur';
import type { HighlighterOptions as ShikiConfig } from 'shiki';
import { logger } from 'src/node/utils';

import type { App } from '../../App';
import { type Plugin } from '../Plugin';
import { handleHMR } from './hmr';
import {
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

  const parseConfig: Partial<ParseMarkdownConfig> = {
    ignoreCache: false,
    pagesDir: '', // set below in `appInit`
    highlight: (code, lang) => highlight?.(code, lang),
    ...parseOptions,
  };

  return {
    name: '@vitebook/markdown',
    enforce: 'pre',
    async vitebookInit(_app) {
      app = _app;

      app.markdoc.base = markdoc;

      filter = createFilter(include, exclude);
      parseConfig.pagesDir = app.dirs.pages.path;

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
    },
    transform(content, id) {
      if (filter(id)) {
        const { output } = parseMarkdown(app, id, content, parseConfig);
        return output;
      }

      return null;
    },
    async handleHotUpdate(ctx) {
      const { file, server, read } = ctx;

      if (filter(file)) {
        const content = await read();

        const { output, ...meta } = await parseMarkdown(
          app,
          file,
          content,
          parseConfig,
        );

        server.ws.send({
          type: 'custom',
          event: 'vitebook::md_meta',
          data: meta,
        });

        ctx.read = () => output;
      }
    },
  };
}
