declare module '*.svelte' {
  const component: typeof import('svelte').SvelteComponent;
  export default component;
}

declare module '*.md' {
  import type { MarkdownMeta } from 'vitebook';

  const __markdownMeta: MarkdownMeta;
  export { __markdownMeta };

  const component: typeof import('svelte').SvelteComponent;
  export default component;
}
