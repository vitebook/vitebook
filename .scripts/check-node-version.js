import execa from 'execa';
import kleur from 'kleur';

async function main() {
  const nodeV = await execa('node', ['-v']);
  const nodeVersion = parseInt(nodeV.stdout.slice(1).split('.')[0]);

  if (nodeVersion < 16) {
    console.warn(
      '\n',
      `⚠️ \u001b[33mThis package requires your Node.js version to be \`>=16\`` +
        ` to work properly.\u001b[39m\n`,
      `\nInstall Volta to automatically manage it by running: ${kleur.bold(
        'curl https://get.volta.sh | bash',
      )}`,
      "\n\nOnce the process has completed, run `npm` commands as usual and it'll just work :)",
      `\n\nSee ${kleur.bold(
        'https://docs.volta.sh/guide',
      )} for more information.`,
      '\n',
    );

    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
