import { watch } from 'vue';
import {
  createMemoryHistory,
  createRouter as _createRouter,
  createWebHistory,
  Router
} from 'vue-router';

import { loadPage } from './composables/usePage';
import { usePages } from './composables/usePages';
import { useTheme } from './composables/useTheme';
import { VuePage } from './types/page';

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
    component: async () => theme.value.NotFound ?? '404 Not Found'
  });

  addRoutes(router, pages.value);
  handleHMR(router);

  return router;
}

const pageRouteDisposal: (() => void)[] | undefined = import.meta.hot
  ? []
  : undefined;

function addRoutes(router: Router, pages: Readonly<VuePage[]>): void {
  pages.forEach((page) => {
    const dispose = router.addRoute({
      name: page.name,
      path: page.route,
      component: () => loadPage(page)
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
        addRoutes(router, pages);
      }
    );

    const theme = useTheme();
    watch(
      () => theme.value,
      (theme) => {
        router.addRoute({
          name: 'NotFound',
          path: '/:pathMatch(.*)*',
          component: async () => theme.NotFound ?? '404 Not Found'
        });
      }
    );
  }
}
