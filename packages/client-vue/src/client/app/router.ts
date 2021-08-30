import {
  createMemoryHistory,
  createRouter as _createRouter,
  createWebHistory,
  Router,
  RouterOptions
} from 'vue-router';

import { useSiteConfig } from './app/composables/useSiteConfig';
import { pageRef } from './app/composables/useStoryboardPage';
import { StoryboardPage } from './types';
import { EXTERNAL_URL_REGEX, inBrowser } from './utils';

/**
 * We are just using the fake URL to parse the pathname and hash - the base doesn't matter and is
 * only passed to support same-host hrefs.
 */
const fakeHost = `http://a.com`;

export function createRouter(): Router {
  const router = _createRouter({
    /**
     * Use appropriate history implementation for client/server, `import.meta.env.SSR` is injected
     * by Vite.
     */
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes: buildBaseRoutes()
  });

  router.addRoute('vitebook', {
    path: ':pathMatch(.*)+',
    component: buildStoryboardPageLoader()
  });

  return router;
}

function buildBaseRoutes(): RouterOptions['routes'] {
  return [
    {
      name: 'home',
      path: '/',
      component: () => import('@vitebook/vue/theme/Home.vue')
    },
    {
      name: 'vitebook',
      path: '/vitebook',
      component: () => import('@vitebook/vue/theme/Vitebook.vue')
    },
    {
      path: '/vitebook.html',
      component: () => import('@vitebook/vue/theme/Vitebook.vue')
    },
    {
      name: '404',
      path: '/:pathMatch(.*)*',
      component: () => import('@vitebook/vue/theme/404.vue')
    }
  ];
}

function buildStoryboardPageLoader() {
  return async () => {
    const url = new URL(window.location.href, fakeHost);
    const path = url.pathname;
    const pageFilePath = pathToFile(path);

    try {
      const mod: { default: StoryboardPage } = await import(
        /*@vite-ignore*/ pageFilePath
      );

      pageRef.value = mod.default;

      return mod.default.component();
    } catch (e) {
      console.error(e);
      return import('@vitebook/vue/theme/StoryNotFound.vue');
    }
  };
}

function pathToFile(path: string) {
  let pagePath = path.replace(/\.html$/, '');

  pagePath = decodeURIComponent(pagePath);

  if (pagePath.endsWith('/')) {
    pagePath += 'index';
  }

  if (import.meta.env.DEV) {
    // Always force re-fetch content in dev.
    pagePath += `?t=${Date.now()}`;
  } else {
    /**
     * In production, each story file is built into a `.js` file following the path
     * conversion scheme: `/vitebook/foo/bar.html` -> `./storyboard_foo_bar.js`
     */

    if (inBrowser) {
      const base = import.meta.env.BASE_URL;
      pagePath = pagePath.slice(base.length).replace(/\//g, '_') + '.js';

      /**
       * Client production build needs to account for page hash, which is injected directly in
       * the page's html.
       */
      const pageHash = __VB_HASH_MAP__[pagePath.toLowerCase()];
      pagePath = `${base}assets/${pagePath}.${pageHash}.js`;
    } else {
      // SSR build uses much simpler name mapping.
      pagePath = `./${pagePath.slice(1).replace(/\//g, '_')}.js`;
    }
  }

  return pagePath;
}

/**
 * Join two paths by resolving the slash collision.
 */
export function joinPath(base: string, path: string): string {
  return `${base}${path}`.replace(/\/+/g, '/');
}

export function withBase(path: string) {
  const siteConfig = useSiteConfig();

  return EXTERNAL_URL_REGEX.test(path)
    ? path
    : joinPath(siteConfig.value.baseUrl, path);
}
