import { spawn } from 'child_process';
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
let pending = false;
function onChange() {
  if (running) {
    pending = true;
    return;
  }

  running = true;
  spawn('pnpm', [args.script], { stdio: 'inherit', cwd });
  running = false;
  if (pending) onChange();
}

onChange();
chokidar.watch(args.glob).on('change', onChange).on('unlink', onChange);
