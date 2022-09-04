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
      http: 'src/server/http/index.ts',
      'http-vercel': 'src/server/http/vercel.ts',
      'http-polyfills': 'src/server/polyfills.ts',
    },
    target: 'node16',
    platform: 'node',
  },
]);
