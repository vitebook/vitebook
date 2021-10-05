// ** Uncomment if using markdown. **
// import './styles/admonition.css';

// ** Uncomment if using markdown with shiki or prismjs plugin. **
// import './styles/code.css';

import type { ClientTheme } from '@vitebook/client';
import Layout from './layout/Layout.vue';
import NotFound from './layout/404.vue';

const Theme: ClientTheme = {
  explorer: true,
  Layout,
  NotFound,
  configureClientApp({ app, router, env }) {
    // ...
  }
};

export default Theme;
