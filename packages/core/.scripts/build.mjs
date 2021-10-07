import { build } from 'esbuild';
import path from 'upath';
import { fileURLToPath } from 'url';

const esmRequireCode = [
  'const require = createRequire(import.meta.url);',
  'var __require = function(x) { return require(x); };',
  '__require.__proto__.resolve = require.resolve;',
  '\n'
].join('\n');

async function main() {
  const entry = path.resolve(
    // @ts-expect-error - target is set but error?
    path.dirname(fileURLToPath(import.meta.url)),
    '../src/node/index.ts'
  );

  const outdir = path.resolve(
    // @ts-expect-error - target is set but error?
    path.dirname(fileURLToPath(import.meta.url)),
    '../dist'
  );

  const buildOptions = {
    platform: 'node',
    format: 'esm',
    target: 'es2020',
    bundle: true,
    watch: process.argv.includes('--watch'),
    outdir,
    logLevel: 'info',
    external: ['esbuild', 'vite', 'fsevents']
  };

  // @ts-expect-error - `buildOptions` not const
  await build({
    ...buildOptions,
    banner: {
      js: "import { createRequire } from 'module';\n" + esmRequireCode
    },
    entryPoints: [entry]
  });

  const utilsEntry = path.resolve(
    // @ts-expect-error - target is set but error?
    path.dirname(fileURLToPath(import.meta.url)),
    '../src/node/utils/index.ts'
  );

  const cliEntry = path.resolve(
    // @ts-expect-error - target is set but error?
    path.dirname(fileURLToPath(import.meta.url)),
    '../src/node/cli/run.ts'
  );

  // @ts-expect-error - `buildOptions` not const
  await build({
    ...buildOptions,
    banner: { js: esmRequireCode },
    entryPoints: [cliEntry, utilsEntry]
  });
}

main();
