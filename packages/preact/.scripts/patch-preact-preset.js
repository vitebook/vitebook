import { writeFile, readFile } from 'fs/promises';
import { createRequire } from 'module';
import path from 'upath';
import kleur from 'kleur';

// @ts-expect-error - .
export const esmRequire = createRequire(import.meta.url);

async function main() {
  const patchComment = '// Patched by `@vitebook/preact`';

  // @preact/preset-vite
  try {
    const presetEntry = path.resolve(
      path.dirname(esmRequire.resolve('@preact/preset-vite')),
      '../esm/index.mjs',
    );

    let content = await readFile(presetEntry, { encoding: 'utf-8' });

    if (content.includes(patchComment)) {
      return;
    }

    content = content
      .replace(
        'include: ["preact/jsx-runtime"]',
        '// include: ["preact/jsx-runtime"]',
      )
      .replace(
        'return id === "preact/jsx-runtime" ? id : null;',
        '// return id === "preact/jsx-runtime" ? id : null;',
      );

    await writeFile(presetEntry, `${patchComment}\n\n` + content);
  } catch (e) {
    console.error(
      kleur.bold(
        kleur.red(
          '\nFailed patching `@preact/preset-vite`, some functionality might not work:\n\n',
        ),
      ),
      e,
      '\n',
    );
  }

  // @prefresh/vite
  try {
    const prefreshEntry = esmRequire.resolve('@prefresh/vite');
    let content = await readFile(prefreshEntry, { encoding: 'utf-8' });

    if (content.includes(patchComment)) {
      return;
    }

    content = content
      .replace('transform(code, id, ssr', 'transform(code, id, { ssr } = {}')
      .replace(
        "id.includes('node_modules') ||",
        "id.includes('.cache') ||\n        id.includes('node_modules') ||",
      );

    await writeFile(prefreshEntry, `${patchComment}\n\n` + content);
  } catch (e) {
    console.error(
      kleur.bold(
        kleur.red('\nFailed patching `@prefresh/vite`, HMR will not work:\n\n'),
      ),
      e,
      '\n',
    );
  }
}

main();
