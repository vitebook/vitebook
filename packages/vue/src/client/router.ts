import { isVueMarkdownPage } from '@vitebook/plugin-markdown-vue/shared';
import { isStoryPage } from '@vitebook/plugin-story/shared';
import { Component, markRaw, watch } from 'vue';
import {
  createMemoryHistory,
  createRouter as _createRouter,
  createWebHistory,
  Router
} from 'vue-router';

import { setPageRef } from './composables/usePage';
import { usePages } from './composables/usePages';
import { useTheme } from './composables/useTheme';
import { VuePage } from './types/page';
import { VueStoryConfig } from './types/story';

export function createRouter(): Router {
  const theme = useTheme();
  const pages = usePages();

  const router = _createRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes: [],
    scrollBehavior: (to, _, savedPosition) => {
      if (savedPosition) return savedPosition;
      if (to.hash) return { el: to.hash };
      return { top: 0 };
    }
  });

  // Should be overriden by theme.
  router.addRoute({
    path: '/',
    component: async () => 'Home'
  });

  router.addRoute({
    name: 'NotFound',
    path: '/:pathMatch(.*)*',
    component: theme.value.NotFound ?? (() => '404 Not Found')
  });

  addPageRoutes(router, pages.value);
  handleHMR(router);

  return router;
}

const pageRouteDisposal: (() => void)[] | undefined = import.meta.hot
  ? []
  : undefined;

function addPageRoutes(router: Router, pages: Readonly<VuePage[]>): void {
  pages.forEach((page) => {
    const dispose = router.addRoute({
      name: page.name,
      path: page.route,
      component: async () => {
        let component: Component;

        if (isStoryPage(page)) {
          // Story
          const data = await page.loader();

          if ('component' in data.default) {
            component = data.default.component;
            data.default.component = markRaw(data.default.component);
            setPageRef({
              ...page,
              story: data.default as VueStoryConfig
            });
          } else {
            component = data.default;

            if (data.story?.component) {
              data.story.component = markRaw(data.story.component ?? {});
            }

            setPageRef({
              ...page,
              story: data.story
            });
          }
        } else if (isVueMarkdownPage(page)) {
          // Markdown
          const data = await page.loader();
          component = data.default;
          setPageRef({
            ...page,
            data: data.data
          });
        } else {
          component = await page.loader();
        }

        return component;
      }
    });

    pageRouteDisposal?.push(dispose);
  });
}

function handleHMR(router: Router): void {
  if (import.meta.hot) {
    const pages = usePages();

    watch(
      () => pages.value,
      (pages) => {
        pageRouteDisposal?.forEach((dispose) => dispose());
        addPageRoutes(router, pages);
      }
    );
  }
}
