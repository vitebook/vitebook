import { createFilter } from '@rollup/pluginutils';
import { readFile } from 'fs/promises';
import { toHtml } from 'hast-util-to-html';
import kleur from 'kleur';
import type { ViteDevServer } from 'vite';

import type { MarkdownMeta, ServerPage } from '../../../../shared';
import type { App } from '../../App';
import { type VitebookPlugin } from '../Plugin';
import { invalidatePageModule } from '../routes/pages-hmr';
import { handleMarkdownHMR } from './hmr';
import {
  clearMarkdownCache,
  type HighlightCodeBlock,
  parseMarkdown,
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

        const { include, exclude, hastToHtml, highlighter, ...parseOptions } =
          config;

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

        await app.markdoc.init(app);
      },
    },
    async configureServer(server) {
      handleMarkdownHMR(app);
      server.ws.on('vitebook::page_change', ({ rootPath }) => {
        const filePath = app.dirs.root.resolve(rootPath);
        currentPage = app.routes.getPage(filePath);
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

        const layoutIndex = app.routes.getLayoutIndex(file);
        const isLayoutFile = layoutIndex >= 0;

        if (isLayoutFile && currentPage?.layouts.includes(layoutIndex)) {
          clearMarkdownCache(currentPage.filePath);
          invalidatePageModule(server, currentPage);

          const { meta } = parse(
            currentPage.filePath,
            await readFile(currentPage.filePath, { encoding: 'utf-8' }),
          );

          handleMarkdownMetaHMR(server, currentPage.filePath, meta);
        }

        const { output, meta } = parse(file, content);
        ctx.read = () => output;

        if (!isLayoutFile) handleMarkdownMetaHMR(server, file, meta);
      }
    },
  };
}

function handleMarkdownMetaHMR(
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
