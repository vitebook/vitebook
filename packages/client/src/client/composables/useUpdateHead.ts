import { HeadConfig, isObject, isString } from '@vitebook/core';
import { onMount } from 'svelte';
import { get } from 'svelte/store';

import { useSSRContext } from '../context/useSSRContext';
import { currentPageHead } from '../stores/currentPageHead';
import { siteLang } from '../stores/siteLang';

/**
 * Returns function that can be called to force update head tags.
 */
export function useUpdateHead(): () => void {
  if (import.meta.env.SSR) {
    const ssrContext = useSSRContext();

    if (ssrContext) {
      ssrContext.head = get(currentPageHead);
      ssrContext.lang = get(siteLang);
    }

    return () => {
      /** noop */
    };
  }

  const headTags: HTMLElement[] = [];

  const loadHeadTags = (): void => {
    get(currentPageHead).forEach((item) => {
      const tag = queryHeadTag(item);
      if (tag) {
        headTags.push(tag);
      }
    });
  };

  const updateHead = () => {
    headTags.forEach((item) => {
      if (item.parentNode === document.head) {
        document.head.removeChild(item);
      }
    });

    headTags.splice(0, headTags.length);

    get(currentPageHead).forEach((item) => {
      const tag = createHeadTag(item);
      if (tag !== null) {
        document.head.appendChild(tag);
        headTags.push(tag);
      }
    });
  };

  onMount(() => {
    loadHeadTags();
    return currentPageHead.subscribe(() => updateHead());
  });

  return updateHead;
}

const queryHeadTag = ([
  tagName,
  attrs,
  content = '',
]: HeadConfig): HTMLElement | null => {
  const attrsSelector = Object.entries(attrs)
    .map(([key, value]) => {
      if (isString(value)) {
        return `[${key}="${value}"]`;
      }

      if (value === true) {
        return `[${key}]`;
      }

      return '';
    })
    .join('');

  const selector = `head > ${tagName}${attrsSelector}`;
  const tags = Array.from(document.querySelectorAll<HTMLElement>(selector));
  const matchedTag = tags.find((item) => item.innerText === content);
  return matchedTag || null;
};

const createHeadTag = ([
  tagName,
  attrs,
  content,
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
