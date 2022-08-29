import { spawn } from 'node:child_process';
import chokidar from 'chokidar';
import kleur from 'kleur';
import minimist from 'minimist';

const cwd = process.cwd();
const args = minimist(process.argv.slice(2));

if (!args.glob) {
  console.error(kleur.red(`\n\n🚨 Missing glob argument \`--glob\`\n\n`));
}

if (!args.script) {
  console.error(kleur.red(`\n\n🚨 Missing script argument \`--script\`\n\n`));
}

let running = false;
async function onChange() {
  if (running) return;

  running = true;
  await runScript(args.script);
  running = false;
}

function runScript(script) {
  return new Promise((resolve) => {
    const ps = spawn('pnpm', ['run', script], { stdio: 'inherit', cwd });
    ps.on('close', () => {
      resolve();
    });
  });
}

onChange();
chokidar.watch(args.glob).on('change', onChange).on('unlink', onChange);
