import {
  mergeConfig,
  Plugin as VitePlugin,
  UserConfig as ViteConfig,
  ViteDevServer
} from 'vite';

import { buildExportDefaultObj } from '../../../utils/module.js';
import type { App } from '../../App.js';
import { virtualFileIds, virtualFileRequestPaths } from './alias.js';

const virtualRequestPaths = new Set(Object.values(virtualFileRequestPaths));

export function corePlugin(app: App): VitePlugin {
  function startWatchingPages(server: ViteDevServer) {
    // const watcher = watch(userThemeDir, { ignoreInitial: true });
    // ...
    // watcher
    //   .on('add', (filePath) => warnToRestartServer('add', filePath))
    //   .on('unlink', (filePath) => warnToRestartServer('unlink', filePath));
    // server.httpServer?.on('close', () => {
    //   watcher.close();
    // });
    // Plugins on each page
  }

  return {
    name: '@vitebook/core',
    enforce: 'pre',
    config() {
      const baseConfig: ViteConfig = {
        resolve: {
          alias: virtualFileRequestPaths
        }
      };

      return mergeConfig(app.options.vite, baseConfig);
    },
    async configureServer(server) {
      startWatchingPages(server);
    },
    resolveId(id) {
      if (id === virtualFileIds.clientEntry) {
        return { id: app.client.entry.client };
      }

      if (virtualRequestPaths.has(id)) {
        return id;
      }

      return null;
    },
    load(id) {
      if (id === virtualFileIds.noop) {
        return `export default function() {};`;
      }

      if (id === virtualFileIds.siteData) {
        return buildExportDefaultObj(app.site.options);
      }

      if (id === virtualFileIds.pages) {
        return buildExportDefaultObj([]);
      }

      return null;
    },
    async handleHotUpdate(ctx) {
      const { file } = ctx;

      // if (file === configPath) {
      //   const prevBaseUrl = siteConfig.baseUrl;

      //   siteConfig = (
      //     await resolveStoryboardConfig(config.project, config.cliArgs)
      //   ).site;

      //   if (siteConfig.baseUrl !== prevBaseUrl) {
      //     console.warn(
      //       kleur.yellow(
      //         `\n${Icons.Warn} Config \`baseUrl\` was changed. Please restart the dev server.`
      //       )
      //     );
      //   }

      //   return [
      //     /** @type {import('vite').ModuleNode} */ server.moduleGraph.getModuleById(
      //       SITE_CONFIG_REQUEST_PATH
      //     )
      //   ];
      // }

      return undefined;
    }
  };
}
