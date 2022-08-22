import { type VitebookPluginOptions, VM_PREFIX } from '@vitebook/core/node';
import fs from 'fs';
import path from 'upath';

import { renderMarkdoc, svelteMarkdocTags, transformTreeNode } from './markdoc';
import { svelteSSRPlugin } from './svelte-ssr';

const VIRTUAL_APP_ID = `${VM_PREFIX}/svelte/app` as const;

export function sveltePlugin(): VitebookPluginOptions {
  let routesDir: string;

  function resolveAppId() {
    const userAppFile = path.resolve(routesDir, '@app.svelte');
    return fs.existsSync(userAppFile)
      ? { id: userAppFile }
      : { id: '@vitebook/svelte/App.svelte' };
  }

  return [
    {
      name: '@vitebook/svelte',
      enforce: 'pre',
      config() {
        return {
          resolve: {
            alias: {
              [VIRTUAL_APP_ID]: `/${VIRTUAL_APP_ID}`,
            },
          },
        };
      },
      vitebook: {
        enforce: 'pre',
        config(config) {
          routesDir = config.dirs.routes;
          const appId = resolveAppId().id;
          return {
            client: {
              app: appId,
              configFiles: [config.isBuild ? appId : VIRTUAL_APP_ID],
            },
            markdown: {
              markdoc: { tags: svelteMarkdocTags },
              render: renderMarkdoc,
              transformTreeNode: [transformTreeNode],
            },
          };
        },
      },
      resolveId(id) {
        if (id === `/${VIRTUAL_APP_ID}`) {
          return resolveAppId();
        }

        return null;
      },
    },
    svelteSSRPlugin(),
  ];
}
