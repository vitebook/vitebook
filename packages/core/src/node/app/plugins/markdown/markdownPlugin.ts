import { type Config as MarkdocConfig } from '@markdoc/markdoc';
import { createFilter, type FilterPattern } from '@rollup/pluginutils';
import { Options as HastToHtmlConfig, toHtml } from 'hast-util-to-html';
import kleur from 'kleur';
import type { HighlighterOptions as ShikiConfig } from 'shiki';
import { logger } from 'src/node/utils';

import type { App } from '../../App';
import { type Plugin } from '../Plugin';
import { handleHMR } from './hmr';
import {
  HighlightCodeBlock,
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
   * Globs pointing at files which should be included as Markdoc nodes/tags.
   */
  includeNodes: string[];
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
   * Markdoc renderable tree transformers (_after_ AST is transformed into render tree).
   */
  transformContent: ParseMarkdownConfig['transformContent'];
  /**
   * Rendered Markdown output transformers. The output should be a valid Svelte component. You
   * can optionally return `script` and `scriptModule` lines of code to modify script content.
   *
   * @example
   * ```js
   * {
   *   transformOutput: ({ code }) => {
   *     // ...
   *     return {
   *       code: '...', // new output (optional)
   *       script: ['import A from "...";', 'import B from "...';'],
   *       scriptModule: ['export const something = {};'],
   *     };
   *   }
   * }
   * ```
   */
  transformOutput: ParseMarkdownConfig['transformOutput'];
};

export type MarkdownPluginConfig = Partial<ResolvedMarkdownPluginConfig>;

export function markdownPlugin(config: ResolvedMarkdownPluginConfig): Plugin {
  let app: App;
  let filter: (id: string) => boolean;

  const transformed = new Set<string>();

  const {
    include,
    exclude,
    markdoc,
    highlighter,
    includeNodes,
    hastToHtml,
    ...parseOptions
  } = config;

  let highlight: HighlightCodeBlock | null =
    typeof highlighter === 'function' ? highlighter : null;

  const parseConfig: ParseMarkdownConfig = {
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
        include: includeNodes,
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
        transformed.add(id);
        const { output } = parseMarkdown(app, id, content, parseConfig);
        return output;
      }

      return null;
    },
    async handleHotUpdate(ctx) {
      const { file, read } = ctx;

      if (filter(file)) {
        const content = await read();
        const { output } = await parseMarkdown(app, file, content, parseConfig);
        ctx.read = () => output;
      }
    },
  };
}
