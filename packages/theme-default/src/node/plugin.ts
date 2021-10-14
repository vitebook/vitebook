import { App, Plugin, VM_PREFIX } from '@vitebook/core/node';
import { fs, loadModule, logger } from '@vitebook/core/node/utils';
import kleur from 'kleur';

import { VIRTUAL_EMPTY_ICON_MODULE_ID } from '.';
import type { DefaultThemeIconifyOptions } from './iconifyPlugin';
import { DefaultThemeIconsOptions, iconsPlugin } from './iconsPlugin';

export type DefaultThemePluginOptions = {
  icons?: DefaultThemeIconsOptions;
  iconify?: DefaultThemeIconifyOptions;
};

export const PLUGIN_NAME = '@vitebook/theme-default' as const;

const virtualLogo = `${VM_PREFIX}/logo.svg` as const;
const virtualLogoRequestPath = '/' + virtualLogo;
const virtual404Illustration = `${VM_PREFIX}/404.svg` as const;
const virtual404IllustrationRequestPath = '/' + virtual404Illustration;

export function defaultThemePlugin(
  options: DefaultThemePluginOptions = {}
): Plugin {
  let app: App;

  return {
    name: PLUGIN_NAME,
    enforce: 'pre',
    config() {
      return {
        resolve: {
          alias: {
            [virtualLogo]: virtualLogoRequestPath,
            [virtual404Illustration]: virtual404IllustrationRequestPath
          }
        }
      };
    },
    async configureApp(_app) {
      app = _app;

      if (options.iconify) {
        const plugin = await loadIconifyPlugin(app, options.iconify);
        if (plugin) app.plugins.push(plugin);
      } else {
        app.plugins.push(iconsPlugin(options.icons));
      }
    },
    resolveId(id) {
      if (id === virtualLogoRequestPath) {
        return resolveVirtualPublicSvg(app, 'logo');
      } else if (id === virtual404IllustrationRequestPath) {
        return resolveVirtualPublicSvg(app, '404');
      }

      return null;
    }
  };
}

function resolveVirtualPublicSvg(app: App, name: string): string {
  if (app.env.isDev) return `/${name}.svg?raw`;
  const path = app.dirs.public.resolve(`${name}.svg`);
  return fs.existsSync(path) ? `${path}?raw&svg` : VIRTUAL_EMPTY_ICON_MODULE_ID;
}

async function loadIconifyPlugin(
  app: App,
  options: DefaultThemeIconifyOptions
): Promise<Plugin | undefined> {
  try {
    const path = require.resolve(
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
