import {
  type Options as SveltePluginOptions,
  svelte,
} from '@sveltejs/vite-plugin-svelte';
import { type App, type Plugin, VM_PREFIX } from '@vitebook/core/node';
import fs from 'fs';
import { type Plugin as VitePlugin } from 'vite';

import { renderMarkdoc, svelteMarkdocTags, transformTreeNode } from './markdoc';
import { svelteSSRPlugin } from './svelteSSRPlugin';

export type SveltePluginConfig = {
  svelte?: SveltePluginOptions;
};

const VIRTUAL_APP_ID = `${VM_PREFIX}/svelte/app` as const;

export function sveltePlugin(config: SveltePluginConfig = {}): Plugin {
  let app: App;

  return {
    name: '@vitebook/svelte',
    enforce: 'pre',
    config() {
      return {
        resolve: {
          alias: {
            [VIRTUAL_APP_ID]: `/${VIRTUAL_APP_ID}`,
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

      config.client.configFiles.push(VIRTUAL_APP_ID);

      config.markdown.render = renderMarkdoc;
      config.markdown.transformTreeNode.push(transformTreeNode);
    },
    vitebookInit(_app) {
      app = _app;

      if (!app.config.client.app) {
        app.config.client.app = VIRTUAL_APP_ID;
      }

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
      if (id === `/${VIRTUAL_APP_ID}`) {
        const path = app.dirs.pages.resolve('@app.svelte');
        return fs.existsSync(path)
          ? { id: path }
          : { id: require.resolve('@vitebook/svelte/App.svelte') };
      }

      return null;
    },
  };
}
