import Prompts from 'prompts';
import { readdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const { prompts } = Prompts;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packagesDir = path.resolve(__dirname, '../packages');

const packages = readdirSync(packagesDir).filter(
  (dirName) => !dirName.startsWith('.'),
);

const pkgArg = packages.includes(process.argv[2]) ? process.argv[2] : undefined;
const pkgArgIndex = packages.findIndex((pkg) => pkg === pkgArg);

const pkgIndex =
  pkgArgIndex >= 0
    ? pkgArgIndex
    : await prompts.select({
        message: 'Pick a package',
        choices: packages,
        initial: 0,
      });

const pkg = packages[pkgIndex];
const watch = process.argv.includes('-w') || process.argv.includes('--watch');

spawn('pnpm', [`-F ${pkg}`, watch ? 'dev' : 'build'], {
  stdio: 'inherit',
});
