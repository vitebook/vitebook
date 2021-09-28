import { watch } from 'vue';
import {
  createMemoryHistory,
  createRouter as _createRouter,
  createWebHistory,
  Router
} from 'vue-router';

import { Page } from '../shared/types/Page';
import {
  deleteCachedLoadedPage,
  getCachedLoadedPage,
  loadPage,
  setPageRef
} from './composables/usePage';
import { usePages } from './composables/usePages';
import { useTheme } from './composables/useTheme';
import { withBaseUrl } from './helpers/withBaseUrl';

export function createRouter(): Router {
  const theme = useTheme();
  const pages = usePages();

  const router = _createRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes: [],
    scrollBehavior: (to, _, savedPosition) => {
      if (savedPosition) return savedPosition;
      if (to.hash) return { el: to.hash, top: 100, behavior: 'smooth' };
      return { top: 0 };
    }
  });

  router.beforeResolve(({ path }) => {
    const page = pages.value.find((page) => withBaseUrl(page.route) === path);
    const loadedPage = page ? getCachedLoadedPage(page) : undefined;
    setPageRef(loadedPage);
  });

  addRoutes(router, pages.value);
  handleHMR(router);

  if (!router.hasRoute('404')) {
    router.addRoute({
      name: '404',
      path: '/:pathMatch(.*)*',
      component: async () => theme.value.NotFound ?? '404 Not Found'
    });
  }

  return router;
}

const pageRouteDisposal: (() => void)[] | undefined = import.meta.hot
  ? []
  : undefined;

function addRoutes(router: Router, pages: Readonly<Page[]>): void {
  pages.forEach((page) => {
    const path = withBaseUrl(
      page.route === '/404.html' ? '/:pathMatch(.*)*' : page.route
    );

    const dispose = router.addRoute({
      name:
        page.name ??
        page.route.replace('.html', '').slice(page.route === '/' ? 0 : 1),
      path,
      component: () => loadPage(page)
    });

    if (router.currentRoute.value.path === path) {
      router.replace(path);
    }

    pageRouteDisposal?.push(() => {
      dispose();
      deleteCachedLoadedPage(page);
    });
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
  }
}
