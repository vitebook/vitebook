import { exec } from 'child_process';
import { promisify } from 'util';

export async function getNodeMajorVersion() {
  const nodeV = await promisify(exec)('node -v');
  return parseInt(nodeV.stdout.slice(1).split('.')[0]);
}
