import { exec } from 'child_process';
import { promisify } from 'util';

async function main() {
  const nodeV = await promisify(exec)('node -v');
  const nodeVersion = parseInt(nodeV.stdout.slice(1).split('.')[0]);

  if (nodeVersion < 16) {
    console.warn(
      '\n',
      `⚠️ \u001b[33mThis package requires your Node.js version to be \`>=16\`` +
        ` to work properly.\u001b[39m\n`,
      '\nInstall Volta to automatically manage it by running: \x1b[1mcurl https://get.volta.sh | bash\x1b[0m',
      "\n\nOnce the process has completed, run `npm` commands as usual and it'll just work :)",
      '\n\nSee \x1b[1mhttps://volta.sh\x1b[0m for more information.',
      '\n',
    );

    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
