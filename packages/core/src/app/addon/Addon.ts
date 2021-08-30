import type { Plugin } from '../plugin/Plugin.js';

export type AddonPlugin = Plugin & {
  icon: string;
  iconDark: string;
  layout: string;
};
