import { writeFile, readFile } from 'fs/promises';
import { createRequire } from 'module';
import path from 'upath';

export const esmRequire = createRequire(import.meta.url);

async function main() {
  try {
    const debouncePkgPath = path.resolve(
      path.dirname(esmRequire.resolve('just-debounce-it')),
      './package.json',
    );

    const throttlePkgPath = path.resolve(
      path.dirname(esmRequire.resolve('just-throttle')),
      './package.json',
    );

    const debouncePkg = JSON.parse(
      (await readFile(debouncePkgPath)).toString(),
    );

    const throttlePkg = JSON.parse(
      (await readFile(throttlePkgPath)).toString(),
    );

    debouncePkg.exports['./package.json'] = './package.json';
    throttlePkg.exports['./package.json'] = './package.json';

    await writeFile(debouncePkgPath, JSON.stringify(debouncePkg, undefined, 2));
    await writeFile(throttlePkgPath, JSON.stringify(throttlePkg, undefined, 2));
  } catch (e) {
    // ...
  }
}

main();
