import { createFilter, FilterPattern } from '@rollup/pluginutils';
import type { App, Plugin } from '@vitebook/core/node';
import { logger } from '@vitebook/core/node/utils';
import type { MarkdownParser, MarkdownPlugin } from '@vitebook/markdown/node';
import kleur from 'kleur';
import MagicString from 'magic-string';
import { parse, walk } from 'svelte/compiler';

import {
  createMarkdownParser,
  MarkdownParserOptions,
  parseMarkdownToSvelte,
} from './parser';

export const PLUGIN_NAME = '@vitebook/markdown-svelte' as const;

export type SvelteMarkdownPluginOptions = MarkdownParserOptions & {
  /**
   * Filter out which files to be included as svelte markdown pages.
   *
   * @default /\.md($|\?)/
   */
  include?: FilterPattern;

  /**
   * Filter out which files to _not_ be included as svelte markdown pages.
   *
   * @default undefined
   */
  exclude?: FilterPattern;
};

const DEFAULT_INCLUDE_RE = /\.md($|\?)/;

export function svelteMarkdownPlugin(
  options: SvelteMarkdownPluginOptions = {},
): Plugin {
  let app: App;
  let parser: MarkdownParser;
  let isBuild: boolean;
  let define: Record<string, unknown> | undefined;

  const { include, exclude, ...parserOptions } = options;

  const filter = createFilter(include ?? DEFAULT_INCLUDE_RE, exclude);

  /** Page system file paths. */
  const files = new Set<string>();

  return {
    name: PLUGIN_NAME,
    enforce: 'pre',
    configResolved(config) {
      isBuild = config.command === 'build';
      define = config.define;
    },
    async configureApp(_app) {
      app = _app;

      if (!_app.plugins.find((plugin) => plugin.name === '@vitebook/client')) {
        throw logger.createError(
          `${kleur.bold('@vitebook/markdown-svelte')} requires ${kleur.bold(
            '@vitebook/client',
          )}`,
        );
      }

      parser = await createMarkdownParser(parserOptions);
      for (const plugin of app.plugins) {
        const mdPlugin = plugin as MarkdownPlugin;
        await mdPlugin.configureMarkdownParser?.(parser);
      }
    },
    async resolvePage({ filePath }) {
      if (filter(filePath)) {
        files.add(filePath);
        return {
          type: 'svelte:md',
        };
      }

      return null;
    },
    pagesRemoved(pages) {
      pages.forEach(({ filePath }) => {
        files.delete(filePath);
      });
    },
    transform(code, id) {
      if (files.has(id)) {
        const { component } = parseMarkdownToSvelte(app, parser, code, id, {
          escapeConstants: isBuild,
          define,
        });

        return staticify({ content: component, filename: id }).code;
      }

      return null;
    },
    async handleHotUpdate(ctx) {
      const { file, read } = ctx;

      // Hot reload `.md` files as `.svelte` files.
      if (files.has(file)) {
        const content = await read();

        const { component } = parseMarkdownToSvelte(
          app,
          parser,
          content,
          file,
          {
            escapeConstants: isBuild,
            define,
          },
        );

        const optimizedComponent = staticify({
          content: component,
          filename: file,
        }).code;

        ctx.read = () => optimizedComponent;
      }
    },
  };
}

function staticify({
  content,
  filename,
}: {
  content: string;
  filename: string;
}) {
  const mcs = new MagicString(content);
  const ast = parse(content, { filename });

  const staticNodeTypeRE = /(Element|Fragment|Text)/;
  const staticBlocks: (readonly [number, number])[] = [];

  const findStaticBlock = (node) => {
    if (!node.children) {
      return [node.start as number, node.end as number] as const;
    }

    const queue = [node];
    const seen = new Set();

    while (queue.length > 0) {
      const currentNode = queue[0];

      const hasDynamicAttribute = (node.attributes ?? []).some(
        (attr) => attr.value?.[0]?.expression || attr.type !== 'Attribute',
      );

      if (!staticNodeTypeRE.test(currentNode.type) || hasDynamicAttribute) {
        return null;
      }

      if (node.children) {
        for (const child of node.children) {
          if (!seen.has(child)) {
            queue.push(child);
            seen.add(child);
          }
        }
      }

      queue.shift();
    }

    return [node.start as number, node.end as number] as const;
  };

  walk(ast.html, {
    enter(node) {
      if (node.type === 'Element' || node.type === 'Fragment') {
        const staticBlock = findStaticBlock(node);
        if (staticBlock) {
          staticBlocks.push(staticBlock);
          this.skip();
        }
      }
    },
  });

  staticBlocks.forEach(([start, end]) => {
    if (end > start) {
      mcs.overwrite(start, end, `{@html \`${mcs.slice(start, end)}\`}`);
    }
  });

  return {
    code: mcs.toString(),
    map: mcs.generateMap({ source: filename }).toString(),
  };
}
