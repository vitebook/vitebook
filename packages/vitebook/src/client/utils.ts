import type { MarkdownModule } from 'shared/markdown';

import type { ClientModule } from './router/types';

export function isMarkdownModule<T extends ClientModule>(
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

export async function tick() {
  return new Promise((res) => window.requestAnimationFrame(res));
}
