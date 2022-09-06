import { defineConfig, type Options } from 'tsup';

function base(): Options {
  return {
    format: 'esm',
    external: ['rollup', ':virtual'],
    treeshake: true,
    splitting: true,
    dts: true,
    outDir: 'dist',
    esbuildOptions(opts) {
      opts.chunkNames = 'chunks/[name]-[hash].js';
    },
  };
}

export default defineConfig([
  {
    ...base(),
    entry: { client: 'src/client/index.ts' },
    target: 'esnext',
    platform: 'browser',
  },
  {
    ...base(),
    entry: {
      node: 'src/node/index.ts',
      server: 'src/server/index.ts',
      'vercel/edge': 'src/vercel/edge.ts',
      'vercel/fn': 'src/vercel/fn.ts',
    },
    target: 'node16',
    platform: 'node',
  },
]);
