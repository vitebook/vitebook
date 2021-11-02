import './styles/global.css';

// ** Uncomment if using markdown. **
// import './styles/admonition.css';

// ** Uncomment if using markdown with shiki or prismjs plugin. **
// import './styles/code.css';

import type { ClientTheme } from '@vitebook/client';

import Layout from './layout/Layout.svelte';
import NotFound from './layout/404.svelte';

const Theme: ClientTheme = {
  explorer: true,
  Layout,
  NotFound,
  configureRouter(router) {
    // ...
  },
};

export default Theme;
