import './polyfills/focus-visible';
import './styles/vars.css';
import './styles/vars-dark.css';
import './styles/global.css';
import './styles/code.css';
import './styles/admonition.css';

import { ClientTheme, currentRoute, pages } from '@vitebook/client';
import { get } from 'svelte/store';

import Layout from './layout/Layout.svelte';
import NotFound from './layout/NotFound.svelte';
import { localizedThemeConfig } from './stores/localizedThemeConfig';

const theme: ClientTheme = {
  Layout,
  NotFound,
  configureRouter(router) {
    if (!router.hasRoute('/')) {
      const setHomePage = () => {
        const theme = get(localizedThemeConfig);
        const firstPage = get(pages)[0];
        const redirect =
          theme.homePage === false ? firstPage?.route : undefined;

        router.addRoute({
          path: '/',
          redirect,
          loader: () =>
            theme.homePage === false
              ? import('./layout/Blank.svelte')
              : import('./components/home/Home.svelte'),
        });

        if (import.meta.env.DEV) {
          const currentPath = get(currentRoute)?.path;
          if (currentPath === '/') {
            router.go('/', { replace: true });
          }
        }
      };

      if (import.meta.env.DEV) {
        let timer;
        const setHomePageDebounced = () => {
          clearTimeout(timer);
          timer = setTimeout(setHomePage, 100);
        };

        setHomePage();
        localizedThemeConfig.subscribe(setHomePageDebounced);
        pages.subscribe(setHomePageDebounced);
      } else {
        setHomePage();
      }
    }

    router.scrollOffset = () => {
      const navbarHeight =
        parseFloat(
          window
            .getComputedStyle(document.querySelector('.theme.__vbk__')!)
            .getPropertyValue('--vbk--navbar-height'),
        ) * 16;

      return {
        top: navbarHeight,
        left: 0,
      };
    };
  },
};

export * from '../shared';

export default theme;
