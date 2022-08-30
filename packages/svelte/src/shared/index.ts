import { type SvelteComponent } from 'svelte';

export type SvelteConstructor = typeof SvelteComponent;

export type SvelteModule = {
  readonly [id: string]: unknown;
  readonly default: SvelteConstructor;
};

export type SvelteServerModule = {
  readonly [id: string]: unknown;
  readonly default: {
    render(
      props: Record<string, unknown>,
      options: { context: Map<string | symbol, unknown> },
    ): { html: string; head: string; css: string };
  };
};

export {};
