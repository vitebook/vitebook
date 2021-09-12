import './styles/normalize.css';
import './styles/sr-only.css';
import './styles/vars.css';
import './styles/vars-dark.css';
import './styles/global.css';
import './styles/code.css';

import type { VueTheme } from '@vitebook/vue/client';

import OutboundLink from './components/global/OutboundLink.vue';
import { useScrollPromise } from './composables/useScrollPromise';
import NotFound from './layout/404/404.vue';
import Layout from './layout/Layout.vue';

const theme: VueTheme = {
  Layout: Layout,
  NotFound: NotFound,
  configureClientApp({ app, router }) {
    if (!router.hasRoute('/')) {
      router.addRoute({
        name: '/',
        path: '/',
        component: () => import('./components/Home/Home.vue')
      });
    }

    // Unregister the built-in `<OutboundLink>` to avoid warning.
    delete app._context.components.OutboundLink;
    app.component('OutboundLink', OutboundLink);

    // Handle scrollBehavior with transition.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const scrollBehavior = router.options.scrollBehavior!;
    router.options.scrollBehavior = async (...args) => {
      await useScrollPromise().wait();
      return scrollBehavior(...args);
    };
  }
};

export { Layout, NotFound };

export default theme;
