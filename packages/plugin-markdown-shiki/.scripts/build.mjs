import { build } from 'esbuild';
import path from 'upath';
import { fileURLToPath } from 'url';

const esmRequireCode = [
  "import { createRequire } from 'module';",
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

  const outfile = path.resolve(
    // @ts-expect-error - target is set but error?
    path.dirname(fileURLToPath(import.meta.url)),
    '../dist/index.js'
  );

  await build({
    banner: { js: esmRequireCode },
    entryPoints: [entry],
    platform: 'node',
    format: 'esm',
    target: 'es2020',
    bundle: true,
    watch: process.argv.includes('--watch'),
    outfile,
    logLevel: 'info',
    external: ['@vitebook/core', '@vitebook/plugin-markdown', 'shiki']
  });
}

main();
