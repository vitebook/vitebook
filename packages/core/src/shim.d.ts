/// <reference types="vite/client" />
/// <reference types="urlpattern-polyfill" />

declare global {
  interface Window {
    __VBK_DATA_HASH_MAP__: Record<string, string>;
  }
}
