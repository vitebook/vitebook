/// <reference types="urlpattern-polyfill" />

declare module '*.md' {
  const meta: import('./index').MarkdownMeta;
  export { meta };

  const html: string;
  export default html;
}
