import './styles/global.css';

// ** Uncomment if using markdown. **
// import './styles/admonition.css';

// ** Uncomment if using markdown with shiki or prismjs plugin. **
// import './styles/code.css';

import Layout from './layout/Layout.svelte';
import NotFound from './layout/404.svelte';

const Theme = /** @type {import('@vitebook/client').ClientTheme} */ ({
  explorer: true,
  Layout,
  NotFound,
  configureRouter(router) {
    // ...
  },
});

export default Theme;
