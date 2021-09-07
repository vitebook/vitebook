import { createApp as createClientApp, createSSRApp } from 'vue';

import App from './components/App';
import ClientOnly from './components/ClientOnly';
import Page from './components/Page.vue';
import { initRouteLocaleRef } from './composables/useRouteLocale';
import { useSiteOptions } from './composables/useSiteOptions';
import { useTheme } from './composables/useTheme';
import { createRouter } from './router';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function createApp() {
  const app = import.meta.env.PROD ? createSSRApp(App) : createClientApp(App);

  const router = createRouter();
  app.use(router);

  app.component('ClientOnly', ClientOnly);
  app.component('Page', Page);

  const theme = useTheme();
  const siteOptions = useSiteOptions();

  initRouteLocaleRef(router);

  await theme.value.configureApp?.({
    app,
    router,
    siteOptions: siteOptions.value,
    env: import.meta.env
  });

  return { app, router };
}
