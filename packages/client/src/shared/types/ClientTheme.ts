import type {
  SiteOptions,
  Theme as DefaultTheme,
  ThemeConfig,
  VirtualThemeModule as DefaultVirtualThemeModule
} from '@vitebook/core/shared';
import type { App, Component } from 'vue';
import type { Router } from 'vue-router';

export type ClientTheme = DefaultTheme<Component, ConfigureClientAppContext>;

export type ConfigureClientAppContext<Theme extends ThemeConfig = ThemeConfig> =
  {
    app: App;
    router: Router;
    siteOptions: Readonly<SiteOptions<Theme>>;
    env: { isProd: boolean; isSSR: boolean };
  };

export type VirtualClientThemeModule<Theme extends ThemeConfig = ThemeConfig> =
  DefaultVirtualThemeModule<Component, ConfigureClientAppContext<Theme>>;
