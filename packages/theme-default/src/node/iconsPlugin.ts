import type { Plugin } from '@vitebook/core/node';
import { esmRequire, fs, path } from '@vitebook/core/node/utils';
import { isFunction } from '@vitebook/core/shared';

import {
  VIRTUAL_EMPTY_ICON_MODULE_ID,
  VIRTUAL_VITEBOOK_ICONS_RE,
  VitebookIcon
} from './icons';

const ICONS_DIR = path.dirname(
  esmRequire.resolve('@vitebook/theme-default/node/icons/menu.svg')
);
const SIDEBAR_ICONS_DIR = path.resolve(ICONS_DIR, './sidebar-file');
const FILE_ICON_PATH = path.resolve(ICONS_DIR, './sidebar-file/file.svg');

export type IconsRecord = Partial<Record<VitebookIcon, string>>;

export type IconsResolver = (
  icon: VitebookIcon
) =>
  | void
  | null
  | undefined
  | false
  | string
  | Promise<void | null | undefined | false | string>;

export type DefaultThemeIconsOptions = false | IconsRecord | IconsResolver;

const RAW_VUE_ID_RE = /(\?raw&vue|&raw&vue)/;

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
        if (RAW_VUE_ID_RE.test(id)) {
          return "export default () => ''";
        } else {
          return '';
        }
      }

      return null;
    }
  };
}

function getIconFilePath(icon: VitebookIcon): string | false {
  if (icon.startsWith('home-feature-')) {
    return path.resolve(ICONS_DIR, 'home-feature.svg');
  }

  if (icon.startsWith('sidebar-file-')) {
    const type = icon.replace('sidebar-file-', '');

    if (/(md|:md)$/.test(type)) {
      return path.resolve(SIDEBAR_ICONS_DIR, 'md.svg');
    }

    if (/(js|jsx)/.test(type)) {
      return path.resolve(SIDEBAR_ICONS_DIR, 'js.svg');
    }

    if (/(ts|tsx)/.test(type)) {
      return path.resolve(SIDEBAR_ICONS_DIR, 'ts.svg');
    }

    if (/(png|jpeg)/.test(type)) {
      return path.resolve(SIDEBAR_ICONS_DIR, 'image.svg');
    }

    if (/mp4/.test(type)) {
      return path.resolve(SIDEBAR_ICONS_DIR, 'video.svg');
    }

    const iconPath = path.resolve(SIDEBAR_ICONS_DIR, `${type}.svg`);
    return fs.existsSync(iconPath) ? iconPath : FILE_ICON_PATH;
  }

  const iconPath = path.resolve(ICONS_DIR, `${icon}.svg`);
  return fs.existsSync(iconPath) ? iconPath : false;
}
