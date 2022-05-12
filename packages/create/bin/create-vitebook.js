#!/usr/bin/env node

// @ts-check

import fs from 'fs';
import kleur from 'kleur';
import minimist from 'minimist';
import path from 'upath';

import { FRAMEWORKS } from '../src/constants.js';
import { addEslintFeature } from '../src/features/eslint.js';
import { addLintStagedFeature } from '../src/features/lint-staged.js';
import { addPrettierFeature } from '../src/features/prettier.js';
import { addTailwindFeature } from '../src/features/tailwind.js';
import { addTypescriptFeature } from '../src/features/typescript.js';
import { ProjectBuilder } from '../src/ProjectBuilder.js';
import { setupPrompt } from '../src/prompts.js';
import { getNodeMajorVersion } from '../src/utils/getNodeVersion.js';
import { isDirEmpty } from '../src/utils/isDirEmpty.js';
import { toValidPackageName } from '../src/utils/pkg.js';
import { removeTrailingSlash } from '../src/utils/removeTrailingSlash.js';
import { toTitleCase } from '../src/utils/toTitleCase.js';

const argv = minimist(process.argv.slice(2), { string: ['_'] });

async function main() {
  const projectDirName = argv._[0];

  let targetDir = process.cwd();
  if (projectDirName) {
    targetDir = path.resolve(targetDir, projectDirName);
  }

  const projectPkgName = toValidPackageName(projectDirName ?? 'vitebook-app');

  let template = argv.template;
  let theme = argv.theme;
  let features = argv.features?.split(',');
  let workspace = argv.workspace ?? false;

  let link =
    typeof argv.link === 'string' ? removeTrailingSlash(argv.link) : false;

  let projectName = projectDirName ? toTitleCase(projectDirName) : undefined;

  const isTargetDirEmpty = isDirEmpty(targetDir);

  if (targetDir !== process.cwd() && fs.existsSync(targetDir)) {
    console.log(kleur.cyan('\nTarget directory is not empty.\n'));
    return;
  }

  const userInput = await setupPrompt({
    initialProjectName: projectName,
    showTemplatePrompt: false,
    showThemePrompt: false,
    showFeaturesPrompt: !Array.isArray(features),
  });

  // TODO: remove on main release
  userInput.template = 'svelte';
  userInput.theme = '';

  const framework =
    template && FRAMEWORKS.includes(template) ? template : userInput.template;

  console.log(kleur.cyan(`\n🏗️  ${kleur.bold(targetDir)}\n`));

  if (isTargetDirEmpty && !fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir);
  }

  const builder = new ProjectBuilder({
    targetDir,
    link,
    workspace,
    framework: /(preact|react)/.test(framework) ? 'preact' : framework,
    theme: theme ?? userInput.theme,
    features: features ?? userInput.features ?? [],
  });

  console.log(kleur.bold(kleur.cyan(`\nvitebook@${builder.version}\n`)));

  // -------------------------------------------------------------------------------------------
  // Pkg
  // -------------------------------------------------------------------------------------------

  if (isTargetDirEmpty) {
    builder.pkg.addField('name', projectPkgName);
    builder.pkg.addField('description', userInput.projectDescription);
  }

  const scripts = ['dev', 'build', 'preview'];
  const scriptsExist = scripts.some((script) =>
    builder.pkg.hasScriptName(script),
  );
  const scriptsPrefix = scriptsExist ? 'vitebook:' : '';
  const devScript = `${scriptsPrefix}dev`;
  for (const script of scripts) {
    builder.pkg.addScript(
      `${scriptsPrefix}${script}`,
      link
        ? `node node_modules/@vitebook/core/bin/vitebook.js ${script}`
        : `vitebook ${script}`,
      { regexTest: new RegExp(`vitebook(\\.js)? ${script}`) },
    );
  }

  // -------------------------------------------------------------------------------------------
  // Core Dependencies
  // -------------------------------------------------------------------------------------------

  builder.pkg.addVitebookDependency('core');

  builder.pkg.addDependency('svelte', '^3.40.0', { dev: true });
  builder.pkg.addDependency('vite', '^2.9.0', { dev: true });

  // switch (builder.framework) {
  //   case 'vue':
  //     builder.pkg.addDependency('vue', '^3.0.0');
  //     builder.pkg.addDependency('@vue/compiler-sfc', '^3.2.0', { dev: true });
  //     break;
  //   case 'preact':
  //     builder.pkg.addDependency('preact', '^10.5.0');
  //     builder.pkg.addDependency('preact-render-to-string', '^5.1.0');
  //     builder.pkg.addDependency('@babel/core', '^7.15.0', { dev: true });
  //     break;
  // }

  // -------------------------------------------------------------------------------------------
  // Gitignore
  // -------------------------------------------------------------------------------------------

  builder.gitIgnore.save();

  // -------------------------------------------------------------------------------------------
  // Template
  // -------------------------------------------------------------------------------------------

  builder.dirs.src.template.root.copyDir('.', builder.dirs.dest.root);

  // -------------------------------------------------------------------------------------------
  // Features
  // -------------------------------------------------------------------------------------------

  addTailwindFeature(builder);
  addTypescriptFeature(builder);
  addEslintFeature(builder);
  addPrettierFeature(builder);
  addLintStagedFeature(builder);

  // -------------------------------------------------------------------------------------------
  // Finish
  // -------------------------------------------------------------------------------------------

  builder.pkg.save();
  await builder.runHooks('postBuild');

  console.log(kleur.bold(kleur.green(`✅ Done. Now run:\n`)));

  if (targetDir !== process.cwd()) {
    console.log(kleur.bold(`  cd ${path.relative(process.cwd(), targetDir)}`));
  }

  const packageManager = builder.pkg.manager;
  switch (packageManager) {
    case 'yarn':
      console.log(kleur.bold('  yarn'));
      console.log(kleur.bold(`  yarn ${devScript}`));
      break;
    case 'pnpm':
      console.log(kleur.bold('  pnpm install'));
      console.log(kleur.bold(`  pnpm ${devScript}`));
      break;
    default:
      console.log(
        kleur.bold(`  ${workspace ? 'pnpm' : packageManager} install`),
      );
      console.log(
        kleur.bold(
          `  ${workspace ? 'pnpm' : `${packageManager} run`} ${devScript}`,
        ),
      );
      break;
  }

  const nodeVersion = await getNodeMajorVersion();

  if (nodeVersion < 14) {
    console.warn(
      `\n\n⚠️ ${kleur.yellow(
        `This package requires your Node.js version to be \`>=14\` to work properly (detected v${nodeVersion}).`,
      )}`,
      `\n\n1. Install Volta to automatically manage it by running: ${kleur.bold(
        'https://get.volta.sh | bash',
      )}`,
      `\n2. Make sure you're inside the correct directory: ${kleur.bold(
        `cd ${path.relative(process.cwd(), targetDir)}`,
      )}`,
      `\n3. Pin the package version: ${kleur.bold('volta pin node@14')}`,
      "\n4. Done! Run `npm` commands as usual and it'll just work :)",
      `\n\nSee ${kleur.bold('https://volta.sh')} for more information.`,
      '\n',
    );
  }

  console.log();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
