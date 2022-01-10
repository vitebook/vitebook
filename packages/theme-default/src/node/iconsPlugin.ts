import type { Plugin } from '@vitebook/core/node';
import { isFunction } from '@vitebook/core/node';
import { fs, path } from '@vitebook/core/node/utils';
import { fileURLToPath } from 'url';

import {
  VIRTUAL_EMPTY_ICON_MODULE_ID,
  VIRTUAL_VITEBOOK_ICONS_RE,
  VitebookIcon,
} from './icons';

const ICONS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'icons',
);

const SIDEBAR_ICONS_DIR = path.resolve(ICONS_DIR, './sidebar-file');
const BRAND_ICONS_DIR = path.resolve(ICONS_DIR, './brand');
const FILE_ICON_PATH = path.resolve(ICONS_DIR, './sidebar-file/file.svg');

const ADDON_ICONS_DIR = path.resolve(ICONS_DIR, './addon');
const UNKNOWN_ADDON_ICON_PATH = path.resolve(ICONS_DIR, './addon/unknown.svg');

export type IconsRecord = Partial<Record<VitebookIcon, string>>;

export type IconsResolver = (
  icon: VitebookIcon,
) =>
  | void
  | null
  | undefined
  | false
  | string
  | Promise<void | null | undefined | false | string>;

export type DefaultThemeIconsOptions = false | IconsRecord | IconsResolver;

const RAW_ID_RE = /(\?|&)raw/;

export function iconsPlugin(resolver?: DefaultThemeIconsOptions): Plugin {
  return {
    name: '@vitebook/theme-default/icons',
    enforce: 'pre',
    async resolveId(id) {
      const match = id.match(VIRTUAL_VITEBOOK_ICONS_RE);

      if (match) {
        const name = match[1] as VitebookIcon;
        const qs = match[2];

        if (resolver === false) {
          return VIRTUAL_EMPTY_ICON_MODULE_ID + qs;
        }

        const icon = isFunction(resolver)
          ? await resolver(name)
          : resolver?.[name] ?? getIconFilePath(name);

        if (!icon) {
          return VIRTUAL_EMPTY_ICON_MODULE_ID + qs;
        }

        return `${icon}${qs}`;
      }

      return null;
    },
    async load(id) {
      if (id.startsWith(VIRTUAL_EMPTY_ICON_MODULE_ID)) {
        if (RAW_ID_RE.test(id)) {
          return "export default ''";
        } else {
          return '';
        }
      }

      return null;
    },
  };
}

function getIconFilePath(icon: VitebookIcon): string | false {
  if (icon.startsWith('home-feature-')) {
    return path.resolve(ICONS_DIR, 'home-feature.svg');
  }

  if (icon.startsWith('addon-')) {
    const name = icon.replace('addon-', '');
    const iconPath = path.resolve(ADDON_ICONS_DIR, `${name}.svg`);
    return fs.existsSync(iconPath) ? iconPath : UNKNOWN_ADDON_ICON_PATH;
  }

  if (icon.startsWith('sidebar-file-')) {
    const type = icon.replace('sidebar-file-', '').replace(/^\w+:/, '');

    switch (type) {
      case 'jsx':
        return path.resolve(SIDEBAR_ICONS_DIR, 'js.svg');
      case 'tsx':
        return path.resolve(SIDEBAR_ICONS_DIR, 'ts.svg');
      case 'png':
      case 'jpeg':
        return path.resolve(SIDEBAR_ICONS_DIR, 'image.svg');
      case 'mp4':
        return path.resolve(SIDEBAR_ICONS_DIR, 'video.svg');
    }

    const iconPath = path.resolve(SIDEBAR_ICONS_DIR, `${type}.svg`);
    return fs.existsSync(iconPath) ? iconPath : FILE_ICON_PATH;
  }

  if (icon.startsWith('brand-')) {
    const brand = icon.replace('brand-', '');
    const iconPath = path.resolve(BRAND_ICONS_DIR, `${brand}.svg`);
    if (fs.existsSync(iconPath)) return iconPath;
  }

  const iconPath = path.resolve(ICONS_DIR, `${icon}.svg`);
  return fs.existsSync(iconPath) ? iconPath : false;
}
