import {
  HeadConfig,
  isObject,
  isString,
  VitebookSSRContext
} from '@vitebook/core/shared';
import { onMounted, ref, useSSRContext, watch } from 'vue';

import { usePageHead } from './usePageHead';
import { useSiteLang } from './useSiteLang';

/**
 * Returns function that can be called to force update head tags.
 */
export function useUpdateHead(): () => void {
  const head = usePageHead();
  const lang = useSiteLang();

  if (import.meta.env.SSR) {
    const ssrContext: VitebookSSRContext | undefined = useSSRContext();

    if (ssrContext) {
      ssrContext.head = head.value;
      ssrContext.lang = lang.value;
    }

    return () => {
      /** noop */
    };
  }

  const headTags = ref<HTMLElement[]>([]);

  const loadHeadTags = (): void => {
    head.value.forEach((item) => {
      const tag = queryHeadTag(item);
      if (tag) {
        headTags.value.push(tag);
      }
    });
  };

  const updateHead = () => {
    headTags.value.forEach((item) => {
      if (item.parentNode === document.head) {
        document.head.removeChild(item);
      }
    });

    headTags.value.splice(0, headTags.value.length);

    head.value.forEach((item) => {
      const tag = createHeadTag(item);
      if (tag !== null) {
        document.head.appendChild(tag);
        headTags.value.push(tag);
      }
    });
  };

  onMounted(() => {
    loadHeadTags();
    updateHead();
    watch(
      () => [head.value],
      () => updateHead()
    );
  });

  return updateHead;
}

const queryHeadTag = ([
  tagName,
  attrs,
  content = ''
]: HeadConfig): HTMLElement | null => {
  const attrsSelector = Object.entries(attrs).map(([key, value]) => {
    if (isString(value)) {
      return `[${key}="${value}"]`;
    }

    if (value === true) {
      return `[${key}]`;
    }

    return '';
  });

  const selector = `head > ${tagName}${attrsSelector}`;
  const tags = Array.from(document.querySelectorAll<HTMLElement>(selector));
  const matchedTag = tags.find((item) => item.innerText === content);
  return matchedTag || null;
};

const createHeadTag = ([
  tagName,
  attrs,
  content
]: HeadConfig): HTMLElement | null => {
  if (!isString(tagName)) {
    return null;
  }

  const tag = document.createElement(tagName);

  if (isObject(attrs)) {
    Object.entries(attrs).forEach(([key, value]) => {
      if (isString(value)) {
        tag.setAttribute(key, value);
      } else if (value === true) {
        tag.setAttribute(key, '');
      }
    });
  }

  if (isString(content)) {
    tag.appendChild(document.createTextNode(content));
  }

  return tag;
};
