import { globby } from 'globby';
import kleur from 'kleur';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

async function main() {
  const mjsFiles = await globby(['../packages/*/dist/node/**/*.js'], {
    cwd: dirname(fileURLToPath(import.meta.url)),
  });

  const ok = [];
  const fail = [];

  let i = 0;
  await Promise.all(
    mjsFiles.map((mjsFile) => {
      const mjsPath = `./${mjsFile}`;
      return import(mjsPath)
        .then(() => {
          ok.push(mjsPath);
        })
        .catch((err) => {
          const color = i++ % 2 === 0 ? kleur.magenta : kleur.red;
          console.error(color('\n\n-----\n' + i + '\n'));
          console.error(mjsPath, err);
          console.error(color('\n-----\n\n'));
          fail.push(mjsPath);
        });
    }),
  );

  ok.length && console.log(kleur.dim(`${ok.length} OK:\n- ${ok.join('\n- ')}`));

  fail.length &&
    console.error(kleur.red(`${fail.length} FAIL:\n- ${fail.join('\n- ')}`));

  if (fail.length) {
    console.error('\n🚨 FAILED\n');
    process.exit(1);
  } else if (ok.length) {
    console.error('\n✅ SUCCESS\n');
    process.exit(0);
  } else {
    console.error('⚠️ No files analyzed!\n');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
