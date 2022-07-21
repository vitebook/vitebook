import { build } from 'esbuild';
import path from 'upath';
import minimist from 'minimist';

const requireShim = [
  "import __vitebook__path from 'path';",
  "import { fileURLToPath as __vitebook__fileURLToPath } from 'url';",
  "import { createRequire as __vitebook__createRequire } from 'module';",
  'const require = __vitebook__createRequire(import.meta.url);',
  'var __require = function(x) { return require(x); };',
  '__require.__proto__.resolve = require.resolve;',
  'const __filename = __vitebook__fileURLToPath(import.meta.url);',
  'const __dirname = __vitebook__path.dirname(__filename);',
  '\n',
].join('\n');

const args = minimist(process.argv.slice(2));

async function main() {
  const entryArg = args.entry ?? 'src/node/index.ts';

  const entry = (entryArg.includes(',') ? entryArg.split(',') : [entryArg]).map(
    (p) => path.resolve(process.cwd(), p),
  );

  const outdir = path.resolve(process.cwd(), args.outdir ?? 'dist/node');

  await build({
    banner: { js: requireShim },
    entryPoints: entry,
    outdir,
    platform: 'node',
    format: 'esm',
    target: 'es2020',
    watch: args.watch || args.w,
    bundle: true,
    minify: true,
    logLevel: 'info',
    external: [
      /@vitebook/,
      '@vitebook/core',
      '@vitebook/client',
      '@vitebook/markdown',
      '@vue/compiler-sfc',
      'esbuild',
      'fsevents',
      'svelte',
      'vue',
      'vite',
      'rollup',
      ...(args.external?.split(',') ?? []),
    ],
    plugins: [
      {
        name: 'chalk-fix',
        setup(build) {
          build.onResolve({ filter: /#(ansi|supports)/ }, ({ path }) => {
            const id = path.slice(1);
            return {
              path: `${process.cwd()}/node_modules/chalk/source/vendor/${id}/index.js`,
            };
          });
        },
      },
    ],
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
