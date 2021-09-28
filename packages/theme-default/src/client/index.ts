import './styles/normalize.css';
import './styles/vars.css';
import './styles/vars-dark.css';
import './styles/global.css';
import './styles/utils.css';
import './styles/components/button.css';
import './styles/components/scrim.css';
import './styles/components/code.css';
import './styles/components/theme-switch.css';
import './styles/components/admonition.css';
import './styles/components/floating-toc.css';
import './styles/layout/navbar.css';
import './styles/layout/sidebar.css';
import './styles/layout/home.css';
import './styles/layout/page.css';
import './styles/layout/404.css';
import './styles/layout/layout.css';

import { loadPage, Theme, useFirstPage } from '@vitebook/client';
import { h, watch } from 'vue';

import OutboundLink from './components/global/OutboundLink.vue';
import { useLocalizedThemeConfig } from './composables/useLocalizedThemeConfig';
import {
  routerScrollBehaviour,
  useRouterScroll
} from './composables/useRouterScroll';
import NotFound from './layout/404.vue';
import Layout from './layout/Layout.vue';

export * from '../shared/index';

const BlankPage = Promise.resolve({
  name: 'Blank',
  render() {
    return h('div');
  }
});

const theme: Theme = {
  Layout: Layout,
  NotFound: NotFound,
  configureClientApp({ app, router }) {
    if (!router.hasRoute('/')) {
      const theme = useLocalizedThemeConfig();
      const firstPage = useFirstPage();

      watch(
        () => [theme.value, firstPage.value],
        () => {
          router.addRoute({
            name: '/',
            path: '/',
            component: () =>
              theme.value.homePage === false
                ? firstPage.value
                  ? loadPage(firstPage.value)
                  : BlankPage
                : import('./components/Home/Home.vue')
          });

          if (router.currentRoute.value.name === '/') {
            router.replace('/');
          }
        },
        { immediate: true }
      );
    }

    // Unregister the built-in `<OutboundLink>` to avoid warning.
    delete app._context.components.OutboundLink;
    app.component('OutboundLink', OutboundLink);

    // Handle scrollBehavior with transition.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const scrollBehavior = router.options.scrollBehavior!;
    router.options.scrollBehavior = async (to, ...args) => {
      await useRouterScroll().wait();

      if (to.hash) {
        const navbarHeight =
          document.querySelector('.navbar')?.getBoundingClientRect().height ??
          0;

        return {
          el: to.hash,
          top: navbarHeight,
          behavior: routerScrollBehaviour.value
        };
      }

      return scrollBehavior(to, ...args);
    };
  }
};

export { Layout, NotFound };

export default theme;
