#!/usr/bin/env node

// @ts-check

import fs from 'fs';
import kleur from 'kleur';
import minimist from 'minimist';
import path from 'upath';

import { FRAMEWORKS, THEMES } from '../src/constants.js';
import { addEslintFeature } from '../src/features/eslint.js';
import { addLintStagedFeature } from '../src/features/lint-staged.js';
import { addPrettierFeature } from '../src/features/prettier.js';
import { addTailwindFeature } from '../src/features/tailwind.js';
import { addTypescriptFeature } from '../src/features/typescript.js';
import { ProjectBuilder } from '../src/ProjectBuilder.js';
import { overwritePrompt, setupPrompt } from '../src/prompts.js';
import { emptyDir } from '../src/utils/emptyDir.js';
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

  let template = argv.template;
  let theme = argv.theme;
  let features = argv.features?.split(',');
  let workspace = argv.workspace ?? false;
  let overwriteProjectDir = false;

  let link =
    typeof argv.link === 'string' ? removeTrailingSlash(argv.link) : false;

  let projectName = projectDirName ? toTitleCase(projectDirName) : undefined;

  const isTargetDirEmpty = isDirEmpty(targetDir);

  const targetDirHasPackageJson =
    !isTargetDirEmpty && fs.existsSync(path.resolve(targetDir, 'package.json'));

  const configDir = path.resolve(targetDir, '.vitebook');
  const configDirExists = fs.existsSync(configDir);

  if (targetDir !== process.cwd() && fs.existsSync(targetDir)) {
    const { overwrite } = await overwritePrompt();
    overwriteProjectDir = overwrite;
    if (!overwrite) return;
    await emptyDir(targetDir);
  }

  const userInput = await setupPrompt({
    isTargetDirEmpty,
    initialProjectName: projectName,
    initialPackageName: toValidPackageName(projectDirName ?? ''),
    showPackageNamePrompt: !targetDirHasPackageJson,
    showTemplatePrompt: !template || !FRAMEWORKS.includes(template),
    showThemePrompt: !theme || !THEMES.includes(theme),
    showFeaturesPrompt: !Array.isArray(features),
    showOverwriteConfigPrompt: !overwriteProjectDir && configDirExists,
  });

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
    builder.pkg.addField('name', userInput.packageName);
    builder.pkg.addField('description', userInput.projectDescription);
  }

  ['dev', 'build', 'preview'].forEach((script) => {
    builder.pkg.addScript(
      `vitebook:${script}`,
      link
        ? `node node_modules/@vitebook/core/bin/vitebook.js ${script}`
        : `vitebook ${script}`,
      { regexTest: new RegExp(`vitebook(\\.js)? ${script}`) },
    );
  });

  // -------------------------------------------------------------------------------------------
  // Core Dependencies
  // -------------------------------------------------------------------------------------------

  builder.pkg.addVitebookDependency('client');
  builder.pkg.addVitebookDependency('core');

  builder.pkg.addDependency('svelte', '^3.49.0', { dev: true });
  builder.pkg.addDependency('vite', '^3.0.0', { dev: true });

  switch (builder.framework) {
    case 'vue':
      builder.pkg.addVitebookDependency('vue');

      builder.pkg.addDependency('vue', '^3.0.0');
      builder.pkg.addDependency('@vue/compiler-sfc', '^3.2.26', { dev: true });
      builder.pkg.addDependency('@vitejs/plugin-vue', '^3.0.0', { dev: true });

      if (builder.hasFeature('markdown'))
        builder.pkg.addVitebookDependency('markdown-vue');
      break;
    case 'preact':
      builder.pkg.addVitebookDependency('preact');

      builder.pkg.addDependency('preact', '^10.5.14');
      builder.pkg.addDependency('preact-render-to-string', '^5.1.19');
      builder.pkg.addDependency('@babel/core', '^7.15.8', { dev: true });
      builder.pkg.addDependency('@preact/preset-vite', '^2.3.0', { dev: true });

      if (builder.hasFeature('markdown'))
        builder.pkg.addVitebookDependency('markdown-preact');
      break;
    case 'svelte':
      builder.pkg.addDependency('@sveltejs/vite-plugin-svelte', '^1.0.1', {
        dev: true,
      });

      if (builder.hasFeature('markdown'))
        builder.pkg.addVitebookDependency('markdown-svelte');
  }

  if (builder.theme === 'default') {
    builder.pkg.addVitebookDependency('theme-default');
  }

  // -------------------------------------------------------------------------------------------
  // Gitignore
  // -------------------------------------------------------------------------------------------

  builder.gitIgnore.save();

  // -------------------------------------------------------------------------------------------
  // Theme
  // -------------------------------------------------------------------------------------------

  if (overwriteProjectDir || userInput.overwrite || !configDirExists) {
    builder.dirs.dest.config.empty();
    builder.dirs.dest.config.make();
    builder.dirs.dest.theme.make();

    builder.dirs.src.template.root.copyDir('.', builder.dirs.dest.config);

    builder.dirs.src.template.root.copyFile(
      'public/manifest.json',
      builder.dirs.dest.config,
      { replace: { __PROJECT_NAME__: toTitleCase(userInput.projectName) } },
    );

    if (builder.theme === 'blank') {
      builder.dirs.src.template.theme.blank.copyDir(
        '.',
        builder.dirs.dest.theme,
      );
    } else if (builder.theme === 'custom') {
      builder.dirs.src.template.theme.custom.copyDir(
        '.',
        builder.dirs.dest.theme,
      );
    } else {
      builder.dirs.dest.theme.writeFile(
        `index.${builder.hasFeature('typescript') ? 'ts' : 'js'}`,
        [
          "import Theme from '@vitebook/theme-default';",
          '',
          'export default Theme;',
          '',
        ].join('\n'),
      );
    }

    builder.dirs.dest.theme.deleteFile(
      `index.${builder.hasFeature('typescript') ? 'js' : 'ts'}`,
    );
  }

  // -------------------------------------------------------------------------------------------
  // Features
  // -------------------------------------------------------------------------------------------

  addTailwindFeature(builder);
  addTypescriptFeature(builder);
  addEslintFeature(builder);
  addPrettierFeature(builder);
  addLintStagedFeature(builder);

  if (builder.hasFeature('markdown')) {
    let ext = '.js';
    let viteFileContent = builder.dirs.dest.root.readFile('vite.config.js');

    if (viteFileContent.length === 0) {
      ext = '.ts';
      viteFileContent = builder.dirs.dest.root.readFile('vite.config.ts');
    }

    let frameworkPluginName = '@sveltejs/vite-plugin-svelte';
    let includeStatement = `\n{\n  ${kleur.bold(
      "extensions: ['.svelte', '.md']",
    )}\n}`;

    switch (builder.framework) {
      case 'vue':
        frameworkPluginName = '@vitejs/plugin-vue';
        includeStatement = `\n{\n  ${kleur.bold('include: /\\.(md|vue)$/')}\n}`;
        break;
      case 'preact':
        frameworkPluginName = '@preact/preset-vite';
        includeStatement = `\n{\n  ${kleur.bold(
          'include: /\\.([j|t]sx?|md)$/',
        )}\n}`;
        break;
    }

    const hasOwnFrameworkPlugin = viteFileContent.includes(frameworkPluginName);

    if (hasOwnFrameworkPlugin) {
      console.warn(
        kleur.yellow(
          `\nDetected ${kleur.bold(frameworkPluginName)} in ${kleur.bold(
            `vite.config${ext}`,
          )}`,
        ),
        '\n\nTo complete adding markdown support, add the following line to the plugin options:\n',
        includeStatement,
        '\n\n',
      );
    }
  }

  // -------------------------------------------------------------------------------------------
  // Configuration File
  // -------------------------------------------------------------------------------------------

  if (overwriteProjectDir || userInput.overwrite || !configDirExists) {
    const frameworkDir = builder.dirs.src.template[builder.framework];

    const frameworkFileExt =
      (builder.framework === 'svelte' && '.svelte') ||
      (builder.framework === 'vue' && '.vue') ||
      (builder.hasFeature('typescript') ? '.tsx' : '.jsx');

    const hasSvelteKit =
      builder.framework === 'svelte' &&
      builder.pkg.hasDependency('@sveltejs/kit');

    frameworkDir.copyFile(
      `config${hasSvelteKit ? '.kit' : ''}${
        builder.hasFeature('markdown') ? '.md' : ''
      }.js`,
      builder.dirs.dest.config.resolve(
        `config${builder.hasFeature('typescript') ? '.ts' : '.js'}`,
      ),
      {
        replace: {
          // Fix app file name for preact.
          'App.tsx': `App${builder.hasFeature('typescript') ? '.tsx' : '.jsx'}`,
          // Site name.
          __SITE_NAME__: userInput.projectName ?? '',
          // Site description.
          __SITE_DESCRIPTION__: userInput.projectDescription ?? '',
          '\\s\\/\\*\\* __CONFIG__ \\*\\/': '',
          // Import default theme, if required.
          '\\s\\/\\*\\* __IMPORTS__ \\*\\/':
            builder.theme === 'default'
              ? `\nimport { defaultThemePlugin${
                  builder.hasFeature('typescript')
                    ? ', DefaultThemeConfig '
                    : ' '
                }} from '@vitebook/theme-default/node';`
              : '',
          // Add generic import for `DefaultThemeConfig`, if required.
          '\\(\\/\\*\\* __GENERICS__ \\*\\/\\)':
            builder.theme === 'default' && builder.hasFeature('typescript')
              ? '<DefaultThemeConfig>'
              : '',
          // Add default theme plugin, if required.
          '\\s\\/\\*\\* __PLUGINS__ \\*\\/,':
            builder.theme === 'default' ? ',\n    defaultThemePlugin(),' : '',
          // Add JSDoc theme type, if required.
          '\\/\\*\\* __THEME_TYPE__  \\*\\/\\s': builder.hasFeature(
            'typescript',
          )
            ? ''
            : "/** @type {(import('@vitebook/theme-default/node').DefaultThemeConfig} */\n    ",
        },
      },
    );

    const appSrcFileName = `App${
      builder.framework !== 'preact' && builder.hasFeature('typescript')
        ? '.ts'
        : ''
    }${frameworkFileExt}`;

    frameworkDir.copyFile(
      appSrcFileName,
      builder.dirs.dest.config.resolve(`App${frameworkFileExt}`),
      {
        replace: {
          '\\s*\\/\\*\\*\\s__APP_IMPORTS__\\s\\*\\*\\/\\s*': builder.hasFeature(
            'tailwind',
          )
            ? `${builder.framework !== 'preact' ? '\n' : ''}${
                builder.framework === 'svelte' ? '  ' : ''
              }import './global.css';\n\n${
                builder.framework === 'svelte' ? '  ' : ''
              }`
            : builder.framework !== 'preact'
            ? `\n${builder.framework === 'svelte' ? '  ' : ''}`
            : '',
        },
      },
    );
  }

  // -------------------------------------------------------------------------------------------
  // Finish
  // -------------------------------------------------------------------------------------------

  builder.pkg.save();

  console.log(kleur.bold(kleur.green(`✅ Done. Now run:\n`)));

  if (targetDir !== process.cwd()) {
    console.log(kleur.bold(`  cd ${path.relative(process.cwd(), targetDir)}`));
  }

  const packageManager = builder.pkg.manager;
  switch (packageManager) {
    case 'yarn':
      console.log(kleur.bold('  yarn'));
      console.log(kleur.bold('  yarn vitebook:dev'));
      break;
    case 'pnpm':
      console.log(kleur.bold('  pnpm install'));
      console.log(kleur.bold('  pnpm vitebook:dev'));
      break;
    default:
      console.log(
        kleur.bold(`  ${workspace ? 'pnpm' : packageManager} install`),
      );
      console.log(
        kleur.bold(
          `  ${workspace ? 'pnpm' : `${packageManager} run`} vitebook:dev`,
        ),
      );
      break;
  }

  const nodeVersion = await getNodeMajorVersion();

  if (nodeVersion < 16) {
    console.warn(
      `\n\n⚠️ ${kleur.yellow(
        `This package requires your Node.js version to be \`>=16\` to work properly (detected v${nodeVersion}).`,
      )}`,
      `\n\n1. Install Volta to automatically manage it by running: ${kleur.bold(
        'https://get.volta.sh | bash',
      )}`,
      `\n2. Make sure you're inside the correct directory: ${kleur.bold(
        `cd ${path.relative(process.cwd(), targetDir)}`,
      )}`,
      `\n3. Pin the package version: ${kleur.bold('volta pin node@16')}`,
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
