import {
  type Options as SveltePluginOptions,
  svelte,
} from '@sveltejs/vite-plugin-svelte';
import {
  type App,
  type ClientPlugin,
  virtualModuleRequestPath,
} from '@vitebook/core/node';
import fs from 'fs';
import { type Plugin as VitePlugin } from 'vite';

import { renderMarkdoc, svelteMarkdocTags, transformTreeNode } from './markdoc';
import { svelteSSRPlugin } from './svelteSSRPlugin';

export type SveltePluginConfig = {
  svelte?: SveltePluginOptions;
};

export function sveltePlugin(config: SveltePluginConfig = {}): ClientPlugin {
  let app: App;

  const clientEntry = require.resolve(`@vitebook/svelte/entry-client.js`);
  const serverEntry = require.resolve(`@vitebook/svelte/entry-server.js`);
  const isLocal = clientEntry.includes('packages/svelte/dist/client');

  return {
    name: '@vitebook/svelte',
    enforce: 'pre',
    entry: {
      client: clientEntry,
      server: serverEntry,
    },
    config() {
      return {
        server: {
          fs: {
            strict: !isLocal,
          },
        },
        plugins: [svelteSSRPlugin()],
      };
    },
    vitebookConfig(config) {
      // @ts-expect-error - ignore readonly.
      config.markdown.markdoc.tags = {
        ...config.markdown.markdoc.tags,
        ...svelteMarkdocTags,
      };

      config.markdown.render = renderMarkdoc;
      config.markdown.transformTreeNode.push(transformTreeNode);
    },
    vitebookInit(_app) {
      app = _app;

      const hasSveltePlugin = app.vite?.config.plugins
        ?.flat()
        .some(
          (plugin) =>
            plugin && (plugin as VitePlugin).name === 'vite-plugin-svelte',
        );

      if (!hasSveltePlugin) {
        app.plugins.push(
          svelte({
            ...config.svelte,
            extensions: [
              '.svelte',
              '.md',
              ...(config.svelte?.extensions ?? []),
            ],
            compilerOptions: {
              ...config.svelte?.compilerOptions,
              hydratable: true,
            },
          }),
        );
      }
    },
    resolveId(id) {
      if (id === virtualModuleRequestPath.app) {
        const path = app.dirs.pages.resolve('@app.svelte');
        return fs.existsSync(path)
          ? { id: path }
          : { id: require.resolve('@vitebook/svelte/App.svelte') };
      }

      return null;
    },
  };
}
