import type { Plugins } from '@vitebook/core';
import type { MarkdownParser } from '@vitebook/plugin-markdown';
import createVuePlugin, {
  Options as VuePluginOptions
} from '@vitejs/plugin-vue';
import type { ViteDevServer } from 'vite';

import { MarkdownVueHmrEvent, MarkdownVueHmrPayload } from './hmr.js';
import type { ResolvedMarkdownVuePage } from './page.js';
import {
  createMarkdownParser,
  MarkdownParserOptions,
  parseMarkdownToVue
} from './parser/index.js';

export const PLUGIN_NAME = 'vitebook/plugin-markdown-vue' as const;

export type MarkdownVuePluginOptions = MarkdownParserOptions & {
  vue?: VuePluginOptions;
  vuePlugin?: ReturnType<typeof createVuePlugin>;
};

export function markdownVuePlugin(
  options: MarkdownVuePluginOptions = {}
): Plugins {
  let server: ViteDevServer;
  let parser: MarkdownParser;
  let isBuild: boolean;
  let define: Record<string, unknown> | undefined;

  /** Page system file paths. */
  const files = new Set<string>();
  /** Page file path to route map. */
  const routes = new Map<string, string>();

  const { vue, vuePlugin: userVuePlugin, ...markdownParserOptions } = options;

  // SET PROCESS ENV

  const vuePlugin =
    userVuePlugin ??
    createVuePlugin({
      include: [/\.vue$/, /\.md$/],
      ...vue
    });

  return [
    {
      name: PLUGIN_NAME,
      enforce: 'pre',
      configResolved(config) {
        isBuild = config.command === 'build';
        define = config.define;
      },
      async configureApp() {
        parser = await createMarkdownParser(markdownParserOptions);
      },
      configureServer(devServer) {
        server = devServer;
      },
      async resolvePage({
        filePath,
        route
      }): Promise<ResolvedMarkdownVuePage | void> {
        if (filePath.endsWith('.md')) {
          files.add(filePath);
          routes.set(filePath, route);
          return {
            type: 'md.vue'
          };
        }
      },
      pagesRemoved(pages) {
        pages.forEach(({ filePath }) => {
          files.delete(filePath);
          routes.delete(filePath);
        });
      },
      transform(source, id) {
        if (files.has(id)) {
          const { vue } = parseMarkdownToVue(parser, source, id, {
            escapeConstants: isBuild,
            define
          });

          return vue;
        }

        return null;
      },
      async handleHotUpdate(ctx) {
        const { file, read } = ctx;

        // Hot reload `.md` files as `.vue` files.
        if (files.has(file)) {
          const content = await read();

          const { vue, data } = parseMarkdownToVue(parser, content, file, {
            escapeConstants: isBuild,
            define
          });

          const payload: MarkdownVueHmrPayload[MarkdownVueHmrEvent.DataUpdate] =
            {
              data,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              route: routes.get(file)!
            };

          server.ws.send({
            type: 'custom',
            event: MarkdownVueHmrEvent.DataUpdate,
            data: JSON.stringify(payload)
          });

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return vuePlugin.handleHotUpdate!({
            ...ctx,
            read: () => vue
          });
        }
      }
    },
    !userVuePlugin ? vuePlugin : undefined
  ];
}
