import './styles/normalize.css';
import './styles/sr-only.css';
import './styles/vars.css';
import './styles/vars-dark.css';
import './styles/global.css';
import './styles/code.css';

import { loadPage, useFirstPage, VueTheme } from '@vitebook/client';
import { h, watch } from 'vue';

import OutboundLink from './components/global/OutboundLink.vue';
import { useLocalizedThemeConfig } from './composables/useLocalizedThemeConfig';
import { useScrollPromise } from './composables/useScrollPromise';
import NotFound from './layout/404/404.vue';
import Layout from './layout/Layout.vue';

export * from '../shared/index';

const BlankPage = Promise.resolve({
  name: 'Blank',
  render() {
    return h('div');
  }
});

const theme: VueTheme = {
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
    router.options.scrollBehavior = async (...args) => {
      await useScrollPromise().wait();
      return scrollBehavior(...args);
    };
  }
};

export { Layout, NotFound };

export default theme;
