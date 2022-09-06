/// <reference types="vite/client" />
/// <reference types="urlpattern-polyfill" />

declare global {
  interface Window {
    __VBK_TRAILING_SLASH__?: boolean;
    __VBK_STATIC_DATA__: Record<string, string>;
    __VBK_STATIC_DATA_HASH_MAP__: Record<string, string>;
    __VBK_STATIC_REDIRECTS_MAP__: Record<string, string>;
  }
}
