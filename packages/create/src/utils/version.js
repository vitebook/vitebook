import { exec } from 'node:child_process';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'upath';
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
