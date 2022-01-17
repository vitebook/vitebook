import { spawn } from 'child_process';
import fs from 'fs';

const nodeVersionScriptPath = '../../.scripts/check-node-version.js';

async function main() {
  if (fs.existsSync(nodeVersionScriptPath)) {
    await spawn('node', [nodeVersionScriptPath], {
      stdio: 'inherit',
    });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
