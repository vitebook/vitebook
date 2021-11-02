import { path, fs } from '@vitebook/core/node/utils';
import { fileURLToPath } from 'url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.resolve(currentDir, '../src/node/icons');

const dest = path.resolve(currentDir, '../dist/node/icons');

async function main() {
  await fs.ensureDir(dest);
  await fs.copy(iconsDir, dest);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
