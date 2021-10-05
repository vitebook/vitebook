import { isFunction } from '@vitebook/core/shared';
import { Component, Ref, ref, shallowReadonly, watch } from 'vue';

import type { ClientPage, LoadedClientPage } from '../../shared';
import { usePages } from './usePages';

export type PageRef = Ref<Readonly<LoadedClientPage> | undefined>;

// Singleton.
const pageRef: PageRef = ref(undefined);

const loadedPageCache = new WeakMap<ClientPage, LoadedClientPage>();

export function usePage(): Readonly<PageRef> {
  return shallowReadonly(pageRef);
}

export function getCachedLoadedPage(
  page: ClientPage
): LoadedClientPage | undefined {
  return loadedPageCache.get(page);
}

export function deleteCachedLoadedPage(page: ClientPage): void {
  loadedPageCache.delete(page);
}

export function setPageRef(loadedPage?: LoadedClientPage): void {
  pageRef.value = loadedPage ? shallowReadonly(loadedPage) : undefined;
}

export async function loadPage(page: ClientPage): Promise<Component> {
  const mod = await page.loader();

  const component = mod.default;

  const meta = isFunction(mod.__pageMeta)
    ? await mod.__pageMeta(page, mod)
    : mod.__pageMeta;

  const loadedPage = {
    ...page,
    module: mod,
    meta: meta ?? {}
  } as LoadedClientPage;
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
