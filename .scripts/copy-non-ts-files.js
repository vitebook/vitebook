import fs from 'fs-extra';
import chokidar from 'chokidar';
import path from 'path';
import minimist from 'minimist';
import fastGlob from 'fast-glob';

const args = minimist(process.argv.slice(2));

const watch = args.watch || args.w;

const targetDir = path.resolve(process.cwd(), args.entry ?? 'src/client');
const destDir = path.resolve(process.cwd(), args.outdir ?? 'dist/client');
const glob = `${targetDir}/**/!(*.(js|ts)(x)?|tsconfig.json)`;

function resolveDest(file) {
  return path.resolve(destDir, path.relative(targetDir, file));
}

if (watch) {
  chokidar
    .watch(glob)
    .on('change', (file) => fs.copy(file, resolveDest(file)))
    .on('add', (file) => fs.copy(file, resolveDest(file)))
    .on('unlink', (file) => fs.remove(resolveDest(file)));
} else {
  const files = fastGlob.sync(glob, { absolute: true });

  files.forEach((file) => {
    fs.copy(file, resolveDest(file));
  });
}
