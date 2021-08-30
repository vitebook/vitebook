// import App from '@vitebook/vue/theme/App.vue';
// import userClientHook from '@vitebook/vue/user/client';
import { createHead } from '@vueuse/head';
import { createApp as createClientApp, createSSRApp } from 'vue';

// import ClientOnly from './app/components/global/ClientOnly';
import { createRouter } from './router';

export function createApp() {
  const app = import.meta.env.PROD ? createSSRApp(App) : createClientApp(App);

  const head = createHead();
  app.use(head);

  const router = createRouter();
  app.use(router);

  // app.component('ClientOnly', ClientOnly);

  // userClientHook({ app, router, env: import.meta.env });

  return { app, router };
}
