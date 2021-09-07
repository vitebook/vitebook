import { createApp as createClientApp, createSSRApp } from 'vue';

import App from './App.js';
import ClientOnly from './components/ClientOnly.js';
import Page from './components/Page.js';
import { createRouter } from './router.js';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function createApp() {
  const app = import.meta.env.PROD ? createSSRApp(App) : createClientApp(App);

  const router = createRouter();
  app.use(router);

  app.component('ClientOnly', ClientOnly);
  app.component('Page', Page);

  // use site options
  // use theme

  // userClientHook({ app, router, env: import.meta.env });
  // enhance app

  return { app, router };
}
