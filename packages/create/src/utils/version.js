import { exec } from 'child_process';
import fs from 'fs';
import path from 'upath';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const vitebookPkgPath = path.resolve(__dirname, '../../package.json');

const vitebookPkgContent = JSON.parse(
  fs.readFileSync(vitebookPkgPath, 'utf-8'),
);

export function getVersion() {
  return vitebookPkgContent.version;
}

export async function getNodeMajorVersion() {
  const nodeV = await promisify(exec)('node -v');
  return parseInt(nodeV.stdout.slice(1).split('.')[0]);
}
