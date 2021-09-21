import { App as VueApp, createApp as createClientApp, createSSRApp } from 'vue';
import type { Router } from 'vue-router';
import Shadow from 'vue-shadow-dom';

import App from './components/App';
import ClientOnly from './components/ClientOnly';
import OutboundLink from './components/OutboundLink/OutboundLink';
import PageView from './components/PageView';
import { useLocalizedSiteOptions } from './composables/useLocalizedSiteOptions';
import { initRouteLocaleRef } from './composables/useRouteLocale';
import { useTheme } from './composables/useTheme';
import { createRouter } from './router';

export async function createApp(): Promise<{ app: VueApp; router: Router }> {
  const app = import.meta.env.PROD ? createSSRApp(App) : createClientApp(App);

  app.use(Shadow);

  const router = createRouter();
  initRouteLocaleRef(router);

  app.component('ClientOnly', ClientOnly);
  app.component('PageView', PageView);
  app.component('OutboundLink', OutboundLink);

  const theme = useTheme();
  const site = useLocalizedSiteOptions();

  await theme.value.configureClientApp?.({
    app,
    router,
    siteOptions: site.value,
    env: import.meta.env
  });

  app.use(router);

  return { app, router };
}
