import { isFunction } from '@vitebook/core/shared';
import { Component, Ref, ref, shallowReadonly, watch } from 'vue';

import { LoadedPage, Page } from '../../shared';
import { usePages } from './usePages';

export type PageRef = Ref<Readonly<LoadedPage> | undefined>;

// Singleton.
const pageRef: PageRef = ref(undefined);

const loadedPageCache = new WeakMap<Page, LoadedPage>();

export function usePage(): Readonly<PageRef> {
  return shallowReadonly(pageRef);
}

export function getCachedLoadedPage(page: Page): LoadedPage | undefined {
  return loadedPageCache.get(page);
}

export function deleteCachedLoadedPage(page: Page): void {
  loadedPageCache.delete(page);
}

export function setPageRef(loadedPage?: LoadedPage): void {
  pageRef.value = loadedPage ? shallowReadonly(loadedPage) : undefined;
}

export async function loadPage(page: Page): Promise<Component> {
  const data = await page.loader();
  const component = data.default;
  const meta = isFunction(data.__pageMeta)
    ? await data.__pageMeta()
    : data.__pageMeta;

  const loadedPage = { ...page, meta: meta ?? {} } as LoadedPage;
  if (loadedPage) loadedPageCache.set(page, loadedPage);

  setPageRef(loadedPage);
  return component;
}

if (import.meta.hot) {
  const pages = usePages();

  watch(
    () => pages.value,
    async (pages) => {
      for (const page of pages) {
        if (page.route === pageRef.value?.route) {
          await loadPage(page);
        }
      }
    }
  );
}
