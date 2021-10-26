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
  explorer: false,
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
              : import('./components/Home/Home.svelte')
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

    router.scrollOffset = () => ({
      top:
        document.querySelector('.navbar')?.getBoundingClientRect().height ?? 0,
      left: 0
    });
  }
};

export default theme;
