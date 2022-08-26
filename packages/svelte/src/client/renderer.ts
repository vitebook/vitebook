import { SvelteComponent } from 'svelte';
import { type ViewRenderer } from 'vitebook';

import { type SvelteModule, SvelteServerModule } from '../shared';

export type SvelteViewRendererOptions = {
  /**
   * Filter files that _can_ be rendered as Svelte views.
   */
  filter?: (id: string) => boolean;
};

export function createSvelteViewRenderer({
  filter,
}: SvelteViewRendererOptions = {}): ViewRenderer<
  SvelteModule,
  SvelteServerModule
> {
  const components = new WeakMap<HTMLElement, SvelteComponent>();

  return {
    name: '@vitebook/svelte',
    attach({ target, context, module, hydrate }) {
      const component = new module.default({ target, context, hydrate });
      components.set(target, component);
    },
    detach({ target }) {
      components.get(target)?.$destroy();
    },
    canRender(id) {
      return (
        id.endsWith('.svelte') ||
        id === ':virtual/vitebook/svelte/app' ||
        (filter?.(id) ?? false)
      );
    },
    ssr({ context, module }) {
      return module.default.render({}, { context });
    },
  };
}
