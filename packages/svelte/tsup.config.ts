import { defineConfig } from 'tsup';

import { base, copyFiles } from '../vitebook/tsup.config';

export default defineConfig([
  {
    ...base({ external: [/\.svelte/] }),
    entry: {
      index: 'src/client/index.ts',
      context: 'src/client/context.ts',
      'entry-client': 'src/client/entry-client.ts',
      'entry-server': 'src/client/entry-server.ts',
    },
    target: 'esnext',
    platform: 'browser',
    outDir: 'dist/client',
    async onSuccess() {
      await copyFiles('**/*.svelte');
    },
  },
  {
    ...base(),
    entry: { index: 'src/node/index.ts' },
    target: 'node16',
    platform: 'node',
    outDir: 'dist/node',
  },
]);
