import { isLoadedMarkdownPage, LoadedClientPage } from '../../shared';
import { get, writable } from './store';
import type { WritableStore } from './types';

export type PageStore = {
  subscribe: WritableStore<LoadedClientPage>['subscribe'];
  __update: WritableStore<LoadedClientPage>['update'];
  __set: WritableStore<LoadedClientPage>['set'];
};

const store = writable<LoadedClientPage>();

export const createPageStore: () => PageStore = () => ({
  subscribe: store.subscribe,
  __update: store.update,
  __set: store.set,
});

if (import.meta.hot) {
  import.meta.hot.on('vitebook::md_meta', ({ filePath, ...meta }) => {
    const page = get(store);
    if (isLoadedMarkdownPage(page) && filePath.endsWith(page.rootPath)) {
      store.update((page) => ({ ...page, meta }));
    }
  });

  store.subscribe((page) => {
    import.meta.hot!.send('vitebook::page_change', {
      rootPath: page?.rootPath ?? '',
    });
  });
}
