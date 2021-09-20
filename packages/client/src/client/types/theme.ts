import type {
  SiteOptions,
  Theme,
  ThemeConfig,
  VirtualThemeModule
} from '@vitebook/core/shared';
import type { App, Component } from 'vue';
import type { Router } from 'vue-router';

export type VueTheme = Theme<Component, ConfigureVueAppContext>;

export type ConfigureVueAppContext<Theme extends ThemeConfig = ThemeConfig> = {
  app: App;
  router: Router;
  siteOptions: Readonly<SiteOptions<Theme>>;
  env: ImportMetaEnv;
};

export type VirtualVueThemeModule<Theme extends ThemeConfig = ThemeConfig> =
  VirtualThemeModule<Component, ConfigureVueAppContext<Theme>>;