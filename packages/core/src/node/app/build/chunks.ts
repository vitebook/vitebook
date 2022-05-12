import { type GetManualChunk } from 'rollup';

export function extendManualChunks(): GetManualChunk {
  return (id) => {
    if (id.includes('vite/')) {
      return 'vite';
    }

    if (id.includes('node_modules')) {
      if (/svelte\//.test(id)) return 'svelte';
      if (/@vitebook/.test(id)) return 'vitebook';
    }

    return null;
  };
}
