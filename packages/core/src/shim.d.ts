/// <reference types="vite/client" />

declare global {
  interface Window {
    __VBK_DATA_HASH_MAP__: Record<string, string>;
  }
}
