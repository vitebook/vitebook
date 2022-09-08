import type { MarkdownModule } from 'shared/markdown';

import type { RouteModule } from './router/types';

export function isMarkdownModule<T extends RouteModule>(
  mod: T,
): mod is T & { module: T['module'] & MarkdownModule } {
  return '__markdownMeta' in mod;
}

export function removeSSRStyles() {
  if (import.meta.env.DEV && !import.meta.env.SSR) {
    const styles = document.getElementById('__VBK_SSR_STYLES__');
    styles?.remove();
  }
}
