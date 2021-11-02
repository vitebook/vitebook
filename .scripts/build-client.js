import { build } from 'esbuild';
import path from 'upath';
import minimist from 'minimist';
import sveltePlugin from 'esbuild-svelte';

const args = minimist(process.argv.slice(2));

async function main() {
  const entryArg = args.entry ?? 'src/client/index.ts';

  const entry = (entryArg.includes(',') ? entryArg.split(',') : [entryArg]).map(
    (p) => path.resolve(process.cwd(), p),
  );

  const outdir = path.resolve(process.cwd(), args.outdir ?? 'dist/client');

  await build({
    entryPoints: entry,
    outdir,
    loader: {
      '.svg': 'file',
    },
    platform: 'browser',
    format: 'esm',
    target: 'es2020',
    watch: args.watch || args.w,
    bundle: true,
    treeShaking: true,
    minify: true,
    logLevel: 'info',
    plugins: [sveltePlugin(), markVirtualModulesAsExternal()],
    external: [
      '@vitebook/core',
      '@vitebook/client',
      '@vitebook/preact',
      '@vitebook/vue',
      'esbuild',
      'svelte',
      'vue',
      'vite',
      ':virtual',
      ...(args.external?.split(',') ?? []),
    ],
  });
}

function markVirtualModulesAsExternal() {
  return {
    name: 'mark-virtual-modules-as-external',
    setup(build) {
      let filter = /:virtual/;
      build.onResolve({ filter }, (args) => ({
        path: args.path,
        external: true,
      }));
    },
  };
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
