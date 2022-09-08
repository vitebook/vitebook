/// <reference types="urlpattern-polyfill" />

declare module '*.md' {
  const __markdownMeta: import('./index').MarkdownMeta;
  export { __markdownMeta as meta };

  const html: string;
  export default html;
}
