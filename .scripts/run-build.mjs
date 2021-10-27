import { spawn } from 'child_process';
import { readdirSync } from 'fs';
import Prompts from 'prompts';
import path from 'upath';
import { fileURLToPath } from 'url';

const { prompts } = Prompts;

// @ts-expect-error
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packagesDir = path.resolve(__dirname, '../packages');

const packages = readdirSync(packagesDir).filter(
  (dirName) => !dirName.startsWith('.')
);

const pkgArg = packages.includes(process.argv[2]) ? process.argv[2] : undefined;
const pkgArgIndex = packages.findIndex((pkg) => pkg === pkgArg);

const pkgIndex =
  pkgArgIndex >= 0
    ? pkgArgIndex
    : // @ts-expect-error
      await prompts.select({
        message: 'Pick a package',
        choices: packages,
        initial: 0
      });

const pkg = packages[pkgIndex];
const watch = process.argv.includes('-w');

spawn(
  'npm',
  ['run', watch ? 'build:watch' : 'build', `--workspace=@vitebook/${pkg}`],
  {
    stdio: 'inherit'
  }
);
