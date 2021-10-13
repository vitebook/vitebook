import { writeFile, readFile } from 'fs/promises';
import { createRequire } from 'module';
import kleur from 'kleur';

// @ts-expect-error - .
export const esmRequire = createRequire(import.meta.url);

async function main() {
  try {
    const prefreshEntry = esmRequire.resolve('@prefresh/core');
    let content = await readFile(prefreshEntry, { encoding: 'utf-8' });
    // TODO: this is pretty bad patch to ensure HMR continues to work because element is mounted
    // inside shadow root. When an async component throws @prefresh will reload page to cleanup
    // if vnode element is not found (which it's never found because of shadow root). We'll
    // raise an issue after release.
    content = content.replace('location.reload();', '');
    await writeFile(prefreshEntry, content);
  } catch (e) {
    console.error(
      kleur.bold(
        kleur.red('\nFailed patching `@prefresh/core`, HMR will not work:\n\n')
      ),
      e,
      '\n'
    );
  }
}

main();
