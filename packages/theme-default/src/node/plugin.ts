import { App, Plugin, VM_PREFIX } from '@vitebook/core/node';
import { fs } from '@vitebook/core/node/utils';

import { VIRTUAL_EMPTY_ICON_MODULE_ID } from '.';
import { DefaultThemeIconsOptions, iconsPlugin } from './iconsPlugin';

export type DefaultThemePluginOptions = {
  icons?: DefaultThemeIconsOptions;
};

export const PLUGIN_NAME = '@vitebook/theme-default' as const;

const virtualLogo = `${VM_PREFIX}/logo.svg` as const;
const virtualLogoRequestPath = '/' + virtualLogo;
const virtual404Illustration = `${VM_PREFIX}/404.svg` as const;
const virtual404IllustrationRequestPath = '/' + virtual404Illustration;

export function defaultThemePlugin(
  options: DefaultThemePluginOptions = {},
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
            [virtual404Illustration]: virtual404IllustrationRequestPath,
          },
        },
      };
    },
    async configureApp(_app) {
      app = _app;
      app.plugins.push(iconsPlugin(options.icons));
    },
    resolveId(id) {
      if (id === virtualLogoRequestPath) {
        return resolveVirtualPublicSvg(app, 'logo');
      } else if (id === virtual404IllustrationRequestPath) {
        return resolveVirtualPublicSvg(app, '404');
      }

      return null;
    },
  };
}

function resolveVirtualPublicSvg(app: App, name: string): string {
  if (app.env.isDev) return `/${name}.svg?raw`;
  const path = app.dirs.public.resolve(`${name}.svg`);
  return fs.existsSync(path) ? `${path}?raw&svg` : VIRTUAL_EMPTY_ICON_MODULE_ID;
}
