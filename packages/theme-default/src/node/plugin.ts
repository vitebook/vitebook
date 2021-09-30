import { App, Plugin } from '@vitebook/core/node';
import { esmRequire, loadModule, logger } from '@vitebook/core/node/utils';
import kleur from 'kleur';

import type { DefaultThemeIconifyOptions } from './iconifyPlugin';
import { DefaultThemeIconsOptions, iconsPlugin } from './iconsPlugin';

export type DefaultThemePluginOptions = {
  icons?: DefaultThemeIconsOptions;
  iconify?: DefaultThemeIconifyOptions;
};

export const PLUGIN_NAME = '@vitebook/theme-default' as const;

export function defaultThemePlugin(
  options: DefaultThemePluginOptions = {}
): Plugin {
  return {
    name: PLUGIN_NAME,
    enforce: 'pre',
    async configureApp(app) {
      if (options.iconify) {
        const plugin = await loadIconifyPlugin(app, options.iconify);
        if (plugin) app.plugins.push(plugin);
      } else {
        app.plugins.push(iconsPlugin(options.icons));
      }
    }
  };
}

async function loadIconifyPlugin(
  app: App,
  options: DefaultThemeIconifyOptions
): Promise<Plugin | undefined> {
  try {
    const path = esmRequire.resolve(
      '@vitebook/theme-default/node/iconifyPlugin.ts'
    );

    const mod = await loadModule<{
      iconifyPlugin: (options: DefaultThemeIconifyOptions) => Plugin;
    }>(path, {
      outdir: app.dirs.tmp.path
    });

    return mod.iconifyPlugin(options);
  } catch (e) {
    throw logger.createError(
      `${kleur.bold(
        '@vitebook/theme-default'
      )} \`iconify\` option requires missing NPM dependencies.\n\n    ${kleur.cyan(
        'npm install -D unplugin-icons @iconify/json'
      )}\n`
    );
  }
}
