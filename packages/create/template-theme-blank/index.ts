import type { ClientTheme } from '@vitebook/client';

import Layout from './layout/Layout.svelte';
import NotFound from './layout/404.svelte';

const Theme: ClientTheme = {
  Layout,
  NotFound,
  configureRouter(router) {
    // ...
  },
};

export default Theme;
