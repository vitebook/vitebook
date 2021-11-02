import {
  currentMarkdownPageMeta,
  currentRoute,
  useRouter,
} from '@vitebook/client';
import { onMount, tick } from 'svelte';
import { get, Readable } from 'svelte/store';

import { throttleAndDebounce } from '../../utils/throttleAndDebounce';

/**
 * Thanks `vuepress-next` for the following code!
 */

export interface UseActiveHeaderLinksOptions {
  headerLinkSelector: string;
  headerAnchorSelector: string;
  delay: number;
  offset: Readable<number>;
}

export function useActiveHeaderLinks({
  headerLinkSelector,
  headerAnchorSelector,
  delay,
  offset: offsetStore,
}: UseActiveHeaderLinksOptions) {
  const router = useRouter();

  const setActiveRouteHash = () => {
    const offset = get(offsetStore);

    const headerLinks: HTMLAnchorElement[] = Array.from(
      document.querySelectorAll(headerLinkSelector),
    );

    const headerAnchors: HTMLAnchorElement[] = Array.from(
      document.querySelectorAll(headerAnchorSelector),
    );

    // Filter anchors that do not have corresponding links.
    const validAnchors = headerAnchors.filter((anchor) =>
      headerLinks.some((link) => link.hash === anchor.hash),
    );

    const scrollTop = Math.max(
      window.pageYOffset,
      document.documentElement.scrollTop,
      document.body.scrollTop,
    );

    const scrollBottom = window.innerHeight + scrollTop;

    // Get the total scroll length of current page.
    const scrollHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
    );

    // Check if we have reached page bottom.
    // Notice the `scrollBottom` might not be exactly equal to `scrollHeight`, so we add an offset.
    const isAtPageBottom = Math.abs(scrollHeight - scrollBottom) < offset;

    for (let i = 0; i < validAnchors.length; i++) {
      const anchor = validAnchors[i];
      const nextAnchor = validAnchors[i + 1];

      const isTheFirstAnchorActive = i === 0 && scrollTop === 0;

      const currentPosition = (anchor.parentElement?.offsetTop ?? 0) - offset;

      // If has scrolled past this anchor.
      const hasPassedCurrentAnchor = scrollTop >= currentPosition;

      // If has not scrolled past next anchor.
      const hasNotPassedNextAnchor =
        !nextAnchor ||
        scrollTop < (nextAnchor.parentElement?.offsetTop ?? 0) - offset;

      // If this anchor is the active anchor.
      const isActive =
        isTheFirstAnchorActive ||
        (hasPassedCurrentAnchor && hasNotPassedNextAnchor);

      if (!isActive) continue;

      const routeHash = decodeURIComponent(get(currentRoute).hash);
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

      router.go(anchorHash, {
        scroll: false,
        replace: true,
      });

      return;
    }
  };

  const onScroll = throttleAndDebounce(
    () => tick().then(setActiveRouteHash),
    delay,
  );

  onMount(() => {
    onScroll();
    window.addEventListener('scroll', onScroll);

    const dispose: (() => void)[] = [];
    dispose.push(currentRoute.subscribe(onScroll));
    dispose.push(currentMarkdownPageMeta.subscribe(onScroll));
    dispose.push(offsetStore.subscribe(onScroll));
    dispose.push(() => {
      window.removeEventListener('scroll', onScroll);
    });

    return () => {
      dispose.forEach((unsub) => unsub());
    };
  });
}
