import { isVueMarkdownPage } from '@vitebook/plugin-markdown-vue/shared';
import { isStoryPage } from '@vitebook/plugin-story/shared';
import { Component, markRaw, Ref, ref, shallowReadonly, watch } from 'vue';

import type { LoadedVuePage, VuePage } from '../types/page';
import type { VueStoryConfig } from '../types/story';
import { usePages } from './usePages';

export type PageRef = Ref<Readonly<LoadedVuePage> | undefined>;

const pageRef: PageRef = ref(undefined);

export function usePage(): Readonly<PageRef> {
  return shallowReadonly(pageRef);
}

export function setPageRef(page?: LoadedVuePage): void {
  pageRef.value = page ? shallowReadonly(page) : undefined;
}

export async function loadPage(page: VuePage): Promise<Component> {
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
