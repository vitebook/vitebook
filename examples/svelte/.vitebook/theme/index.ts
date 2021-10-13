// import Theme from '@vitebook/theme-default';

import type { ClientTheme } from '@vitebook/client';
import Layout from './layout/Layout.svelte';
import NotFound from './layout/NotFound.svelte';

const Theme: ClientTheme = {
  Layout,
  NotFound
};

export default Theme;
