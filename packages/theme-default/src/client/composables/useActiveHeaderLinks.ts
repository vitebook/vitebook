import { useMarkdownPageMeta } from '@vitebook/client';
import { onBeforeUnmount, onMounted, Ref, watch } from 'vue';
import type { Router } from 'vue-router';
import { useRouter } from 'vue-router';

/**
 * Thanks `vuepress-next` for the following code!
 */

export interface UseActiveHeaderLinksOptions {
  headerLinkSelector: string;
  headerAnchorSelector: string;
  delay: number;
  offset: Ref<number>;
}

export const useActiveHeaderLinks = ({
  headerLinkSelector,
  headerAnchorSelector,
  delay,
  offset
}: UseActiveHeaderLinksOptions): void => {
  const router = useRouter();
  const markdownMeta = useMarkdownPageMeta();

  const setActiveRouteHash = (): void => {
    const headerLinks: HTMLAnchorElement[] = Array.from(
      document.querySelectorAll(headerLinkSelector)
    );

    const headerAnchors: HTMLAnchorElement[] = Array.from(
      document.querySelectorAll(headerAnchorSelector)
    );

    // Filter anchors that do not have corresponding links.
    const validAnchors = headerAnchors.filter((anchor) =>
      headerLinks.some((link) => link.hash === anchor.hash)
    );

    const scrollTop = Math.max(
      window.pageYOffset,
      document.documentElement.scrollTop,
      document.body.scrollTop
    );

    const scrollBottom = window.innerHeight + scrollTop;

    // Get the total scroll length of current page.
    const scrollHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    );

    // Check if we have reached page bottom.
    // Notice the `scrollBottom` might not be exactly equal to `scrollHeight`, so we add an offset.
    const isAtPageBottom = Math.abs(scrollHeight - scrollBottom) < offset.value;

    for (let i = 0; i < validAnchors.length; i++) {
      const anchor = validAnchors[i];
      const nextAnchor = validAnchors[i + 1];

      const isTheFirstAnchorActive = i === 0 && scrollTop === 0;

      // If has scrolled past this anchor.
      const hasPassedCurrentAnchor =
        scrollTop >= (anchor.parentElement?.offsetTop ?? 0) - offset.value;

      // If has not scrolled past next anchor.
      const hasNotPassedNextAnchor =
        !nextAnchor ||
        scrollTop < (nextAnchor.parentElement?.offsetTop ?? 0) - offset.value;

      // If this anchor is the active anchor.
      const isActive =
        isTheFirstAnchorActive ||
        (hasPassedCurrentAnchor && hasNotPassedNextAnchor);

      if (!isActive) continue;

      const routeHash = decodeURIComponent(router.currentRoute.value.hash);
      const anchorHash = decodeURIComponent(anchor.hash);

      // If the active anchor hash is current route hash, do nothing.
      if (routeHash === anchorHash) return;

      // Check if anchor is at the bottom of the page to keep hash consistent.
      if (isAtPageBottom) {
        for (let j = i + 1; j < validAnchors.length; j++) {
          // If current route hash is below the active hash, do nothing.
          if (routeHash === decodeURIComponent(validAnchors[j].hash)) {
            return;
          }
        }
      }

      // Replace current route hash with the active anchor hash.
      replaceRouteWithoutScrolling(router, {
        hash: anchorHash,
        force: true
      });

      return;
    }
  };

  const onScroll = throttleAndDebounce(() => setActiveRouteHash(), delay);

  onMounted(() => {
    onScroll();
    window.addEventListener('scroll', onScroll);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll);
  });

  watch(() => [markdownMeta, offset], onScroll);
};

/**
 * Call `router.replace()` without triggering scrolling behaviour.
 */
export const replaceRouteWithoutScrolling = async (
  router: Router,
  ...args: Parameters<Router['replace']>
): Promise<void> => {
  // Temporarily disable `scrollBehavior`.
  const { scrollBehavior } = router.options;
  router.options.scrollBehavior = undefined;
  await router
    .replace(...args)
    .finally(() => (router.options.scrollBehavior = scrollBehavior));
};

function throttleAndDebounce(fn: () => void, delay: number): () => void {
  let timeout: number;
  let called = false;

  return () => {
    if (timeout) {
      window.clearTimeout(timeout);
    }

    if (!called) {
      fn();
      called = true;
      window.setTimeout(() => {
        called = false;
      }, delay);
    } else {
      timeout = window.setTimeout(fn, delay);
    }
  };
}
