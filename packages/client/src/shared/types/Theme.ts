import type {
  SiteOptions,
  Theme as DefaultTheme,
  ThemeConfig,
  VirtualThemeModule as DefaultVirtualThemeModule
} from '@vitebook/core/shared';
import type { App, Component } from 'vue';
import type { Router } from 'vue-router';

export type Theme = DefaultTheme<Component, ConfigureAppContext>;

export type ConfigureAppContext<Theme extends ThemeConfig = ThemeConfig> = {
  app: App;
  router: Router;
  siteOptions: Readonly<SiteOptions<Theme>>;
  env: ImportMetaEnv;
};

export type VirtualThemeModule<Theme extends ThemeConfig = ThemeConfig> =
  DefaultVirtualThemeModule<Component, ConfigureAppContext<Theme>>;
