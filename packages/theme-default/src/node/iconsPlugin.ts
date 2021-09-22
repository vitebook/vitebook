import { Plugin, VM_PREFIX } from '@vitebook/core/node';
import { isFunction, removeLeadingSlash } from '@vitebook/core/shared';
import type { Options as IconOptions } from 'unplugin-icons/dist/index.js';
import Icons from 'unplugin-icons/dist/vite.js';

export type IconCollection = string;
export type IconName = string;
export type IconPath = `${IconCollection}/${IconName}`;

export type VitebookIcon =
  | 'menu'
  | 'menu-caret'
  | 'back-arrow'
  | 'external-link'
  | 'theme-switch-light'
  | 'theme-switch-dark'
  | `home-feature-${number}`
  | `sidebar-file-${string}`
  | `sidebar-folder-open`
  | `sidebar-folder-closed`;

export type VitebookIconRecord = Record<VitebookIcon, IconPath>;

export type VitebookIconResolver = (
  icon: VitebookIcon
) =>
  | void
  | null
  | undefined
  | false
  | IconPath
  | Promise<void | null | undefined | false | IconPath>;

export type DefaultThemeIconsOptions = Omit<
  IconOptions,
  'compiler' | 'jsx' | 'webComponents'
> & {
  vitebook?: false | VitebookIconRecord | VitebookIconResolver;
};

const vitebookIconPathRE = /:virtual\/vitebook\/icons\//;

const VIRTUAL_ICONS_MODULE_ID = `${VM_PREFIX}/vitebook/icons`;
const VIRTUAL_EMPTY_ICON_MODULE_ID = `/${VM_PREFIX}/vitebook/icons/empty`;

const defaultIconResolver: VitebookIconResolver = (icon) => {
  switch (icon) {
    case 'menu':
      return 'heroicons-outline/menu';
    case 'menu-caret':
      return 'heroicons-outline/chevron-down';
    case 'external-link':
      return 'heroicons-outline/external-link';
    case 'back-arrow':
      return 'heroicons-outline/arrow-sm-left';
    case 'theme-switch-light':
      return 'heroicons-outline/sun';
    case 'theme-switch-dark':
      return 'heroicons-outline/moon';
    case 'sidebar-folder-open':
      return 'mdi/folder-open';
    case 'sidebar-folder-closed':
      return 'mdi/folder';
  }

  if (icon.startsWith('home-feature-')) {
    return 'heroicons-outline/star';
  }

  if (icon.startsWith('sidebar-file-')) {
    const type = icon.replace('sidebar-file-', '');
    switch (type) {
      case 'md':
      case 'vue:md':
        return 'mdi/language-markdown';
      case 'vue':
        return 'mdi/vuejs';
      case 'svelte':
        return 'file-icons/svelte';
      case 'js':
      case 'jsx':
        return 'mdi/language-javascript';
      case 'ts':
      case 'tsx':
        return 'mdi/language-typescript';
      case 'html':
        return 'mdi/language-html5';
      case 'svg':
        return 'mdi/svg';
      case 'png':
      case 'jpeg':
        return 'mdi/file-image';
      case 'mp4':
        return 'mdi/file-video';
      default:
        return 'mdi/file';
    }
  }

  return null;
};

export function iconsPlugin(options: DefaultThemeIconsOptions = {}): Plugin {
  const { vitebook: userIconResolver, ...iconsOptions } = options;

  const iconsPlugin = Icons({
    ...iconsOptions,
    compiler: 'vue3'
  });

  return {
    name: 'vitebook/plugin-icons',
    enforce: 'pre',
    config() {
      return {
        resolve: {
          alias: {
            [VIRTUAL_ICONS_MODULE_ID]: '/' + VIRTUAL_ICONS_MODULE_ID
          }
        }
      };
    },
    async resolveId(id, ...context) {
      if (vitebookIconPathRE.test(id)) {
        id = removeLeadingSlash(id);

        const name = id.replace(vitebookIconPathRE, '') as VitebookIcon;

        if (userIconResolver === false) {
          return VIRTUAL_EMPTY_ICON_MODULE_ID;
        }

        const icon = isFunction(userIconResolver)
          ? await userIconResolver(name)
          : userIconResolver?.[name] ?? (await defaultIconResolver(name));

        if (icon === false) {
          return VIRTUAL_EMPTY_ICON_MODULE_ID;
        }

        if (icon) {
          return iconsPlugin.resolveId?.call(
            this,
            `virtual:icons/${icon}`,
            ...context
          );
        }
      }

      return null;
    },
    load(id, ...context) {
      if (id === VIRTUAL_EMPTY_ICON_MODULE_ID) {
        return "export default () => ''";
      }

      return iconsPlugin.load?.call(this, id, ...context);
    }
  };
}
