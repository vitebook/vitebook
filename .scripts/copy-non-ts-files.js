import fs from 'fs-extra';
import chokidar from 'chokidar';
import minimist from 'minimist';
import path from 'node:path';
import { createRequire } from 'node:module';
import { globbySync } from 'globby';
import { preprocess } from 'svelte/compiler';
import { transform } from 'esbuild';

const args = minimist(process.argv.slice(2));
const require = createRequire(import.meta.url);

const watch = args.watch || args.w;
const svelte = args.svelte;

const targetDir = path.resolve(process.cwd(), args.entry ?? 'src/client');
const destDir = path.resolve(process.cwd(), args.outdir ?? 'dist/client');
const typesDir = path.resolve(process.cwd(), args.outdir ?? 'types');
const glob = `${targetDir}/**/*`;

const ignoreRE = /\.(js|ts)$/;
const svelteFileRE = /\.svelte$/;

async function main() {
  if (watch) {
    chokidar
      .watch(glob)
      .on('change', copyWatch)
      .on('add', copyWatch)
      .on('unlink', (file) => fs.remove(resolveDest(file)));
  } else {
    const files = globbySync(glob, { absolute: true });
    await Promise.all([...files.map(copy), svelte && emitSvelteDTS()]);
  }
}

function resolveDest(file) {
  return path.resolve(destDir, path.relative(targetDir, file));
}

async function copyWatch(file) {
  await copy(file);
  if (svelte) await emitSvelteDTS();
}

async function copy(file) {
  if (ignoreRE.test(file)) return;

  const dest = resolveDest(file);

  if (svelteFileRE.test(file)) {
    const content = await processSvelteFile(file);
    await fs.ensureFile(dest);
    await fs.writeFile(dest, content);
    return;
  }

  await fs.copy(file, dest);
}

async function processSvelteFile(file) {
  let contents = fs.readFileSync(file, 'utf-8');

  const preprocessed = await preprocess(contents, [typescriptPreprocessor()], {
    filename: file,
  });

  return stripScriptLangTag(preprocessed.code);
}

async function emitSvelteDTS() {
  const { emitDts } = await import('svelte2tsx');
  await emitDts({
    libRoot: targetDir,
    svelteShimsPath: require.resolve('svelte2tsx/svelte-shims.d.ts'),
    declarationDir: typesDir,
  });
}

/** @returns {import('svelte/types/compiler/preprocess').PreprocessorGroup} */
function typescriptPreprocessor() {
  const typescriptRE = /^(ts|typescript)($||\/)/;

  return {
    async script({ filename, attributes, content }) {
      const isTypescript =
        typeof attributes.lang === 'string' &&
        typescriptRE.test(attributes.lang);

      if (isTypescript) {
        return transform(content, {
          sourcefile: filename,
          charset: 'utf8',
          loader: 'ts',
          format: 'esm',
          minify: false,
          target: 'esnext',
          tsconfigRaw: {
            compilerOptions: {
              importsNotUsedAsValues: 'preserve',
              preserveValueImports: true,
            },
          },
        });
      }

      return { code: content };
    },
  };
}

function stripScriptLangTag(content) {
  return content.replace(
    /(<!--[^]*?-->)|(<script[^>]*?)\s(?:type|lang)=(["']).*?\3/g,
    '$1$2',
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
