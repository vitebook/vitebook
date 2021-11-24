import fs from 'fs';
import path from 'upath';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const vitebookPkgPath = path.resolve(__dirname, '../../package.json');

const vitebookPkgContent = JSON.parse(
  fs.readFileSync(vitebookPkgPath).toString(),
);

export function getVersion() {
  return vitebookPkgContent.version;
}
