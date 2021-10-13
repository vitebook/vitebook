import { build } from 'esbuild';
import path from 'upath';
import { fileURLToPath } from 'url';

const requireShim = [
  "import __vitebook__path from 'path';",
  "import { fileURLToPath as __vitebook__fileURLToPath } from 'url';",
  "import { createRequire as __vitebook__createRequire } from 'module';",
  'const require = __vitebook__createRequire(import.meta.url);',
  'var __require = function(x) { return require(x); };',
  '__require.__proto__.resolve = require.resolve;',
  'const __filename = __vitebook__fileURLToPath(import.meta.url);',
  'const __dirname = __vitebook__path.dirname(__filename);',
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
    banner: { js: requireShim },
    entryPoints: [entry],
    platform: 'node',
    format: 'esm',
    target: 'es2020',
    bundle: true,
    watch: process.argv.includes('--watch'),
    outfile,
    logLevel: 'info',
    external: ['@vitebook/core', '@vitebook/markdown', 'shiki']
  });
}

main();
