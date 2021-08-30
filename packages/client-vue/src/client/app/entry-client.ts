import { createApp } from './main';

const { app, router } = createApp();

// Wait until router is ready before mounting to ensure hydration matches.
router.isReady().then(() => {
  app.mount('#app');
});
