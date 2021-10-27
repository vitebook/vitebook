import { spawn } from 'child_process';
import { readdirSync, readFileSync } from 'fs';
import Prompts from 'prompts';
import path from 'upath';
import { fileURLToPath } from 'url';

const { prompts } = Prompts;

// @ts-expect-error
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const examplesDir = path.resolve(__dirname, '../examples');

const examples = readdirSync(examplesDir).filter(
  (dirName) => !dirName.startsWith('.')
);

const exampleArg = examples.includes(process.argv[2])
  ? process.argv[2]
  : undefined;

const exampleArgIndex = examples.findIndex((example) => example === exampleArg);

const exampleIndex =
  exampleArgIndex >= 0
    ? exampleArgIndex
    : // @ts-expect-error
      await prompts.select({
        message: 'Pick an example',
        choices: examples,
        initial: 0
      });

const example = examples[exampleIndex];
const exampleDir = path.resolve(examplesDir, example);
const examplePkgPath = path.resolve(exampleDir, 'package.json');
const examplePkgContent = JSON.parse(readFileSync(examplePkgPath).toString());
const examplePkgName = examplePkgContent.name;

const scripts = Object.keys(examplePkgContent.scripts);

const scriptArg = process.argv
  .find((arg) => arg.startsWith('--script='))
  ?.replace('--script=', '');

const scriptArgIndex = scripts.findIndex((script) => script === scriptArg);

const scriptIndex =
  scriptArgIndex >= 0
    ? scriptArgIndex
    : // @ts-expect-error
      await prompts.select({
        message: 'Pick a script',
        choices: scripts,
        initial: 0
      });

const script = scripts[scriptIndex];

spawn('npm', ['run', script, `--workspace=${examplePkgName}`], {
  stdio: 'inherit'
});
