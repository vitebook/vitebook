import type { VueTheme } from '@vitebook/vue';

const theme: VueTheme = {
  Layout: () => 'Default theme.',
  NotFound: () => '404',
  configureApp() {
    // console.log(ctx);
  }
};

export default theme;
