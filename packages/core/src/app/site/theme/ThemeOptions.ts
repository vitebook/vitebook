import type { Plugin } from '../plugin/Plugin.js';

export type ThemeOptions = Plugin & {
  extends: string;
  layouts: string | Layouts;
};

export type ThemeConfig = Partial<ThemeOptions>;
