import { writeFile, readFile } from 'fs/promises';
import { createRequire } from 'module';
import kleur from 'kleur';

// @ts-expect-error - .
export const esmRequire = createRequire(import.meta.url);

async function main() {
  try {
    const prefreshEntry = esmRequire.resolve('@prefresh/vite');
    let content = await readFile(prefreshEntry, { encoding: 'utf-8' });
    content = content.replace(
      'transform(code, id, ssr',
      'transform(code, id, { ssr }',
    );
    await writeFile(prefreshEntry, content);
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
