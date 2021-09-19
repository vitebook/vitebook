import { createApp } from './main';

async function mount() {
  const { app, router } = await createApp();

  // Wait until router is ready before mounting to ensure hydration matches.
  router.isReady().then(() => {
    app.mount('#app');
  });
}

mount();
