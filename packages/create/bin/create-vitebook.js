#!/usr/bin/env node

// TODO: This file needs a major refactor but not a priority right now.

import enquirer from 'enquirer';
import fs from 'fs';
import kleur from 'kleur';
import minimist from 'minimist';
import path from 'upath';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const argv = minimist(process.argv.slice(2), { string: ['_'] });

const VITEBOOK_VERSION = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../package.json')).toString(),
).version;

console.log(kleur.bold(kleur.cyan(`\nvitebook@${VITEBOOK_VERSION}\n`)));

const FRAMEWORKS = ['vue', 'svelte', 'preact', 'react'];
const THEMES = ['blank', 'default'];
const GIT_IGNORE = ['.DS_STORE', '.cache', '.temp', 'node_modules/', 'dist/'];

const FEATURES = [
  'markdown',
  'typescript',
  'prettier',
  'eslint',
  'lint-staged',
];

async function main() {
  const projectDirName = argv._[0];

  let targetDir = path.resolve(process.cwd(), projectDirName ?? '.');
  let template = argv.template;
  let theme = argv.theme;
  let features = argv.features?.split(',');
  let workspace = argv.workspace ?? false;
  let local = argv.local ? removeEndingSlash(argv.local) : false;
  let projectName = projectDirName ? toTitleCase(projectDirName) : null;

  const isTargetDirEmpty = isDirEmpty(targetDir);
  const targetDirHasPackageJson =
    !isTargetDirEmpty && fs.existsSync(path.resolve(targetDir, 'package.json'));

  const configDir = path.resolve(targetDir, '.vitebook');
  const configDirExists = fs.existsSync(configDir);

  if (targetDir !== process.cwd() && fs.existsSync(targetDir)) {
    /** @type {{ overwrite: boolean }} */
    const { overwrite } = await enquirer.prompt({
      type: 'confirm',
      name: 'overwrite',
      message: `Directory exists. Overwrite?`,
      initial: false,
    });

    if (!overwrite) {
      return;
    }

    await emptyDir(targetDir);
  }

  /**
   * @type {{
   *  projectName: string;
   *  projectDescription: string;
   *  packageName: string;
   *  template: string;
   *  theme?: string;
   *  features: string[],
   *  overwrite?: boolean
   * }}
   */
  const userInput = await enquirer.prompt(
    /** @type {any} */ (
      [
        {
          type: 'input',
          name: 'projectName',
          message: 'Project Name:',
          initial: projectName,
        },
        {
          type: 'input',
          name: 'projectDescription',
          message: 'Project Description:',
          initial: '',
        },
        !targetDirHasPackageJson && {
          type: 'input',
          name: 'packageName',
          message: 'Package Name:',
          initial: () => toValidPackageName(projectDirName),
          validate: (name) =>
            isValidPackageName(name) ||
            'Invalid package name (https://docs.npmjs.com/cli/v7/configuring-npm/package-json#name)',
        },
        (!template || !FRAMEWORKS.includes(template)) && {
          type: 'select',
          name: 'template',
          message:
            typeof template === 'string' && !FRAMEWORKS.includes(template)
              ? `"${template}" isn't a valid template. Please choose one: `
              : 'Select a framework:',
          initial: 0,
          choices: FRAMEWORKS,
        },
        (!theme || !THEMES.includes(theme)) && {
          type: 'select',
          name: 'theme',
          message:
            typeof theme === 'string' && !FRAMEWORKS.includes(theme)
              ? `"${theme}" isn't a valid theme. Please choose one: `
              : 'Select a theme:',
          initial: 0,
          choices: THEMES,
        },
        !Array.isArray(features) && {
          type: 'multiselect',
          name: 'features',
          message: 'Features:',
          choices: FEATURES,
        },
        configDirExists && {
          type: 'confirm',
          name: 'overwrite',
          message: `\`.vitebook\` directory exists, overwrite?`,
          initial: false,
        },
      ].filter(Boolean)
    ),
  );

  theme = theme ?? userInput.theme;
  const hasBlankTheme = theme === 'blank';
  const hasDefaultTheme = theme === 'default';

  template =
    template && FRAMEWORKS.includes(template) ? template : userInput.template;
  const isVueTemplate = template === 'vue';
  const isSvelteTemplate = template === 'svelte';
  const isPreactTemplate = /(preact|react)/.test(template);

  features = (features ?? userInput.features ?? []).filter(
    (feature) => !FEATURES.includes(feature),
  );
  const hasFeature = (feature) => features.includes(feature);
  const hasPrettierFeature = hasFeature('prettier');
  const hasEslintFeature = hasFeature('eslint');
  const hasMarkdownFeature = hasFeature('markdown');
  const hasLintStagedFeature = hasFeature('lint-staged');
  const hasTypescriptFeature = hasFeature('typescript');

  const lintExtensions = [
    '.js',
    (isPreactTemplate || isVueTemplate) && '.jsx',
    hasTypescriptFeature && '.ts',
    (isPreactTemplate || isVueTemplate) && hasTypescriptFeature && '.tsx',
    isVueTemplate && '.vue',
    isSvelteTemplate && '.svelte',
  ].filter(Boolean);

  // PREPARE

  console.log(kleur.cyan(`\n🏗️  ${kleur.bold(targetDir)}\n`));

  if (isTargetDirEmpty && !fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir);
  }

  // PACKAGE.JSON

  const pkgJsonPath = path.resolve(targetDir, 'package.json');

  const pkg = targetDirHasPackageJson
    ? JSON.parse(fs.readFileSync(pkgJsonPath).toString())
    : {
        name: userInput.packageName,
        description: userInput.projectDescription ?? '',
        version: '0.0.0',
        type: 'module',
        scripts: {
          'vitebook:build': 'vitebook build',
          'vitebook:dev': 'vitebook dev',
          'vitebook:preview': 'vitebook preview',
        },
      };

  pkg.scripts ??= {};
  pkg.dependenices ??= {};
  pkg.devDependencies ??= {};

  if (hasTypescriptFeature) {
    pkg.devDependencies.typescript = '^4.4.4';

    const tsconfigPath = path.resolve(targetDir, 'tsconfig.json');

    if (!fs.existsSync(tsconfigPath)) {
      fs.writeFileSync(
        tsconfigPath,
        JSON.stringify(
          getRawTSConfig({
            jsx: isPreactTemplate ? 'react-jsx' : 'preserve',
            jsxImportSource: isPreactTemplate ? 'preact' : undefined,
          }),
          null,
          2,
        ),
      );
    }
  }

  if (hasEslintFeature) {
    GIT_IGNORE.push('.eslintcache');

    pkg.devDependencies['npm-run-all'] = '^4.1.5';
    pkg.devDependencies.eslint = '^7.32.0';
    pkg.devDependencies['eslint-plugin-import'] = '^2.25.2';
    pkg.devDependencies['eslint-plugin-simple-import-sort'] = '^7.0.0';

    if (!Object.keys(pkg.scripts).includes('lint')) {
      pkg.scripts.lint = 'run-s lint:*';
    }

    pkg.scripts['lint:eslint'] = `eslint --ext ${lintExtensions.join(
      ',',
    )} . --ignore-path .gitignore`;

    if (!Object.keys(pkg.scripts).includes('format')) {
      pkg.scripts.format = 'run-s format:*';
    }

    pkg.scripts['format:eslint'] = 'npm run lint:eslint -- --fix';

    if (hasPrettierFeature) {
      pkg.devDependencies['eslint-config-prettier'] = '^8.3.0';
    }

    if (hasTypescriptFeature) {
      pkg.devDependencies['@typescript-eslint/eslint-plugin'] = '^4.33.0';
      pkg.devDependencies['@typescript-eslint/parser'] = '^4.33.0';
      pkg.devDependencies['eslint-import-resolver-typescript'] = '^2.5.0';
    }

    if (isVueTemplate) {
      pkg.devDependencies['eslint-plugin-vue'] = '^8.0.3';
    }

    if (isSvelteTemplate) {
      pkg.devDependencies['eslint-plugin-svelte3'] = '^3.2.1';
    }

    const eslintConfigPath = path.resolve(targetDir, '.eslintrc.js');

    if (!fs.existsSync(eslintConfigPath)) {
      const eslintConfig = JSON.stringify(
        getRawEslintConfig({
          hasTypescriptFeature,
          hasPrettierFeature,
          isVueTemplate,
          isSvelteTemplate,
        }),
        null,
        2,
      );

      fs.writeFileSync(eslintConfigPath, `module.exports = ${eslintConfig};`);
    }
  }

  if (hasPrettierFeature) {
    pkg.devDependencies['npm-run-all'] = '^4.1.5';
    pkg.devDependencies.prettier = '^2.4.1';

    if (!Object.keys(pkg.scripts).includes('lint')) {
      pkg.scripts.lint = 'run-s lint:*';
    }

    pkg.scripts['lint:prettier'] =
      'prettier . --check --ignore-path .gitignore --loglevel warn';

    if (!Object.keys(pkg.scripts).includes('format')) {
      pkg.scripts.format = 'run-s format:*';
    }

    pkg.scripts['format:prettier'] = 'npm run lint:prettier -- --write';

    const prettierConfigPath = path.resolve(targetDir, '.prettierrc');
    if (!fs.existsSync(prettierConfigPath)) {
      fs.writeFileSync(
        prettierConfigPath,
        JSON.stringify(
          {
            singleQuote: true,
            printWidth: 80,
            tabWidth: 2,
            trailingComma: 'all',
          },
          null,
          2,
        ),
      );
    }
  }

  if (hasLintStagedFeature) {
    pkg.devDependencies['husky'] = '^7.0.4';
    pkg.devDependencies['lint-staged'] = '^11.2.6';

    pkg.scripts.prepare = pkg.scripts.prepare
      ? pkg.scripts.prepare.includes('husky install')
        ? pkg.scripts.prepare
        : `${pkg.scripts.prepare}${
            pkg.scripts.prepare.length > 0 ? '&& ' : ''
          }husky install`
      : 'husky install';

    pkg['lint-staged'] ??= {};

    if (hasEslintFeature) {
      pkg['lint-staged'][
        `*.{${lintExtensions.map((s) => s.slice(1)).join(',')}}`
      ] = 'eslint --cache --fix';
    }

    if (hasPrettierFeature) {
      pkg['lint-staged'][
        `*.{${[...lintExtensions.map((s) => s.slice(1)), 'md', 'json'].join(
          ',',
        )}}`
      ] = 'prettier --write';
    }

    const huskyConfigDir = path.resolve(targetDir, '.husky');
    const huskyPreCommitFilePath = path.resolve(huskyConfigDir, 'pre-commit');

    if (!fs.existsSync(huskyConfigDir)) {
      fs.mkdirSync(huskyConfigDir);
    }

    if (!fs.existsSync(huskyPreCommitFilePath)) {
      fs.writeFileSync(
        huskyPreCommitFilePath,
        [
          '#!/bin/sh',
          '',
          '. "$(dirname "$0")/_/husky.sh"',
          '',
          'npx lint-staged',
        ].join('\n'),
      );
    } else {
      let content = fs.readFileSync(huskyPreCommitFilePath).toString();
      if (!content.includes('npx lint-staged')) {
        content = content + `\nnpx lint-staged`;
        fs.writeFileSync(huskyPreCommitFilePath, content);
      }
    }
  }

  const vitebookVersion = workspace ? 'workspace:*' : `^${VITEBOOK_VERSION}`;

  const addVitebookDependency = (pkgName) => {
    pkg.devDependencies[`@vitebook/${pkgName}`] = local
      ? `${local}/${pkgName}`
      : vitebookVersion;
  };

  addVitebookDependency('client');
  addVitebookDependency('core');

  if (isVueTemplate) {
    pkg.dependenices.vue = '^3.0.0';
    addVitebookDependency('vue');

    if (hasMarkdownFeature) {
      addVitebookDependency('markdown-vue');
    }
  }

  if (isPreactTemplate) {
    pkg.dependenices.preact = '^10.5.14';
    addVitebookDependency('preact');

    if (hasMarkdownFeature) {
      addVitebookDependency('markdown-preact');
    }
  }

  if (isSvelteTemplate) {
    pkg.devDependencies.svelte = '^3.43.1';
    pkg.devDependencies['svelte-preprocess'] = '^4.9.8';

    if (hasMarkdownFeature) {
      addVitebookDependency('markdown-svelte');
    }
  }

  if (hasDefaultTheme) {
    addVitebookDependency('theme-default');
  }

  pkg.scripts = sortObjectKeys(pkg.scripts);
  pkg.dependenices = sortObjectKeys(pkg.dependenices);
  pkg.devDependencies = sortObjectKeys(pkg.devDependencies);
  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2));

  // .GITIGNORE

  const gitignorePath = path.resolve(targetDir, '.gitignore');

  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, GIT_IGNORE.join('\n'));
  } else {
    let gitignoreContent = fs.readFileSync(gitignorePath).toString();
    GIT_IGNORE.forEach((ignore) => {
      if (!gitignoreContent.includes(ignore)) {
        gitignoreContent = gitignoreContent + '\n' + ignore;
      }
    });
    fs.writeFileSync(gitignorePath, gitignoreContent);
  }

  // .VITEBOOK

  const templateConfigDir = path.resolve(__dirname, '../template-root');

  if (userInput.overwrite ?? !configDirExists) {
    if (fs.existsSync(configDir)) {
      emptyDir(configDir);
    } else {
      fs.mkdirSync(configDir);
    }

    copyFile(
      path.resolve(templateConfigDir, 'index.html'),
      path.resolve(configDir, 'index.html'),
    );

    copyDir(
      path.resolve(templateConfigDir, 'public'),
      path.resolve(configDir, 'public'),
    );

    replaceTemplateStrings(path.resolve(configDir, 'public', 'manifest.json'), {
      __PROJECT_NAME__: toTitleCase(userInput.projectName),
    });

    const themeConfigPath = path.resolve(configDir, 'theme');
    const themeIndexPath = path.resolve(
      themeConfigPath,
      `index.${hasTypescriptFeature ? 'ts' : 'js'}`,
    );

    fs.mkdirSync(themeConfigPath);

    if (hasBlankTheme) {
      const customThemeTemplateDir = path.resolve(
        __dirname,
        '../template-theme-custom',
      );

      copyDir(customThemeTemplateDir, themeConfigPath);

      // Delete invalid theme index file.
      fs.unlinkSync(
        path.resolve(
          themeConfigPath,
          `index.${hasTypescriptFeature ? 'js' : 'ts'}`,
        ),
      );
    } else {
      fs.writeFileSync(
        themeIndexPath,
        [
          "import Theme from '@vitebook/theme-default';",
          '',
          'export default Theme;',
          '',
        ].join('\n'),
      );
    }

    const include = getFrameworkIncludes({
      framework: template,
      hasMarkdownFeature,
      hasTypescriptFeature,
    })
      .filter(Boolean)
      .join(', ');

    const plugins = [
      ...getFrameworkPlugins({
        framework: template,
        hasMarkdownFeature,
        hasTypescriptFeature,
      }),
      isSvelteTemplate
        ? `clientPlugin({
      include: /\\.svelte/,
      svelte: {
        extensions: ['.svelte'${hasMarkdownFeature ? ", '.md'" : ''}],
        preprocess: [
          sveltePreprocess({
            // Vitebook internally handles preprocessing typescript with \`esbuild\`.
            typescript: false,
          }),
        ],
      },
    })`
        : 'clientPlugin()',
      hasDefaultTheme && 'defaultThemePlugin()',
    ]
      .filter(Boolean)
      .join(',\n    ');

    fs.writeFileSync(
      path.resolve(configDir, `config.${hasTypescriptFeature ? 'ts' : 'js'}`),
      [
        // Imports
        "import { clientPlugin, defineConfig } from '@vitebook/client/node';",
        ...getFrameworkPluginImports({
          framework: template,
          hasMarkdownFeature,
        }),
        hasDefaultTheme &&
          `import { ${
            hasTypescriptFeature ? 'DefaultThemeConfig, ' : ''
          }defaultThemePlugin } from '@vitebook/theme-default/node';`,
        '',
        // Config
        `export default defineConfig${
          hasTypescriptFeature ? '<DefaultThemeConfig>' : ''
        }({`,
        `  include: [${include}],`,
        `  plugins: [\n    ${plugins},\n  ],`,
        '  site: {',
        `    title: '${userInput.projectName}',`,
        `    description: '${userInput.projectDescription}',`,
        !hasTypescriptFeature &&
          "    /** @type {(import('@vitebook/theme-default/node').DefaultThemeConfig} */",
        '    theme: {',
        '      // ...',
        '    },',
        '  },',
        '});',
        '',
      ]
        .filter((s) => s !== false)
        .join('\n'),
    );
  }

  // SRC

  const srcPath = path.resolve(targetDir, 'src');

  if (!fs.existsSync(srcPath)) {
    fs.mkdirSync(srcPath);
    fs.writeFileSync(path.resolve(srcPath, '.gitkeep'), '');
  }

  // COMPLETE

  const pkgInfo = pkgInfoFromUserAgent(process.env.npm_config_user_agent);
  const pkgManager = pkgInfo ? pkgInfo.name : 'npm';

  console.log(kleur.bold(kleur.green(`✅ Done. Now run:\n`)));

  if (targetDir !== process.cwd()) {
    console.log(kleur.bold(`  cd ${path.relative(process.cwd(), targetDir)}`));
  }

  switch (pkgManager) {
    case 'yarn':
      console.log(kleur.bold('  yarn'));
      console.log(kleur.bold('  yarn vitebook:dev'));
      break;
    case 'pnpm':
      console.log(kleur.bold('  pnpm install'));
      console.log(kleur.bold('  pnpm vitebook:dev'));
      break;
    default:
      console.log(kleur.bold(`  ${workspace ? 'pnpm' : pkgManager} install`));
      console.log(
        kleur.bold(
          `  ${workspace ? 'pnpm' : `${pkgManager} run`} vitebook:dev`,
        ),
      );
      break;
  }

  console.log();
}

function copyFile(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
}

function isValidPackageName(projectName) {
  return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(
    projectName,
  );
}

function toValidPackageName(projectName) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z0-9-~]+/g, '-');
}

function copyDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    copyFile(srcFile, destFile);
  }
}

function replaceTemplateStrings(filePath, replace) {
  let content = fs.readFileSync(filePath).toString();
  Object.keys(replace).forEach((template) => {
    content = content.replace(new RegExp(template, 'g'), replace[template]);
  });
  fs.writeFileSync(filePath, content);
}

function isDirEmpty(path) {
  if (!fs.existsSync(path)) {
    return true;
  }

  return fs.readdirSync(path).length === 0;
}

function emptyDir(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  for (const file of fs.readdirSync(dir)) {
    const abs = path.resolve(dir, file);
    // baseline is Node 12 so can't use rmSync :(
    if (fs.lstatSync(abs).isDirectory()) {
      emptyDir(abs);
      fs.rmdirSync(abs);
    } else {
      fs.unlinkSync(abs);
    }
  }
}

export const removeEndingSlash = (str) => str.replace(/\/$/, '');

function pkgInfoFromUserAgent(userAgent) {
  if (!userAgent) return undefined;
  const pkgSpec = userAgent.split(' ')[0];
  const pkgSpecArr = pkgSpec.split('/');
  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1],
  };
}

function sortObjectKeys(obj) {
  return Object.keys(obj)
    .sort()
    .reduce((o, key) => {
      o[key] = obj[key];
      return o;
    }, {});
}

const WORD_SEPARATORS =
  /[\s\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-./:;<=>?@[\]^_`{|}~]+/;
function toTitleCase(str) {
  const words = str.split(WORD_SEPARATORS);
  const len = words.length;
  const mappedWords = new Array(len);
  for (let i = 0; i < len; i++) {
    const word = words[i];
    if (word === '') {
      continue;
    }
    mappedWords[i] = word[0].toUpperCase() + word.slice(1);
  }
  return mappedWords.join(' ');
}

function getRawEslintConfig({
  hasTypescriptFeature = false,
  hasPrettierFeature = false,
  isVueTemplate = false,
  isSvelteTemplate = false,
}) {
  return {
    env: {
      browser: true,
      es6: true,
      node: true,
    },
    parser: isVueTemplate
      ? 'vue-eslint-parser'
      : hasTypescriptFeature
      ? '@typescript-eslint/parser'
      : undefined,
    parserOptions: {
      project: hasTypescriptFeature ? './tsconfig.json' : undefined,
      parser:
        isVueTemplate && hasTypescriptFeature
          ? '@typescript-eslint/parser'
          : undefined,
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    ignorePatterns: ['.eslintrc.js'],
    plugins: [
      isSvelteTemplate && 'svelte3',
      hasTypescriptFeature && '@typescript-eslint',
      'simple-import-sort',
    ].filter(Boolean),
    overrides: [
      isSvelteTemplate && {
        files: ['*.svelte'],
        processor: 'svelte3/svelte3',
      },
    ].filter(Boolean),
    extends: [
      'eslint:recommended',
      hasTypescriptFeature && 'plugin:@typescript-eslint/recommended',
      'plugin:import/recommended',
      hasTypescriptFeature && 'plugin:import/typescript',
      isVueTemplate && 'plugin:vue/vue3-recommended',
      hasPrettierFeature && !isSvelteTemplate && 'prettier',
    ].filter(Boolean),
    rules: {
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': 'error',
    },
    settings: {
      'import/resolver': hasTypescriptFeature ? { typescript: {} } : undefined,
      'svelte3/typescript':
        isSvelteTemplate && hasTypescriptFeature ? true : undefined,
    },
  };
}

function getRawTSConfig(compilerOptions = {}) {
  return {
    compilerOptions: {
      allowJs: true,
      allowSyntheticDefaultImports: true,
      allowUnreachableCode: false,
      alwaysStrict: true,
      checkJs: true,
      declaration: true,
      declarationMap: true,
      esModuleInterop: true,
      experimentalDecorators: true,
      forceConsistentCasingInFileNames: true,
      jsx: 'preserve',
      jsxImportSource: 'preact',
      lib: ['dom', 'dom.iterable', 'esnext'],
      module: 'esnext',
      moduleResolution: 'node',
      newLine: 'lf',
      noImplicitAny: false,
      noImplicitReturns: true,
      noUnusedLocals: false,
      noUnusedParameters: false,
      preserveWatchOutput: true,
      resolveJsonModule: true,
      skipLibCheck: true,
      sourceMap: true,
      strict: true,
      strictNullChecks: true,
      target: 'esnext',
      useDefineForClassFields: false,
      types: ['node'],
      ...compilerOptions,
    },
    include: ['src'],
    exclude: ['node_modules/**', 'dist/**'],
  };
}

function getFrameworkIncludes({
  framework,
  hasMarkdownFeature = false,
  hasTypescriptFeature = false,
}) {
  switch (framework) {
    case 'svelte':
      return [hasMarkdownFeature && "'src/**/*.md'", `'src/**/*.story.svelte'`];
    case 'vue':
      return [hasMarkdownFeature && "'src/**/*.md'", `'src/**/*.story.vue'`];
    case 'preact':
    case 'react':
      return [
        hasMarkdownFeature && "'src/**/*.md'",
        `'src/**/*.story.${hasTypescriptFeature ? 'tsx' : 'jsx'}'`,
      ];
    default:
      return [];
  }
}

function getFrameworkPlugins({
  framework,
  hasMarkdownFeature = false,
  hasTypescriptFeature = false,
}) {
  switch (framework) {
    case 'svelte':
      return [
        hasMarkdownFeature && 'svelteMarkdownPlugin({ include: /\\.md/, })',
      ];
    case 'vue':
      return [
        hasMarkdownFeature && 'vueMarkdownPlugin({ include: /\\.md/, })',
        `vuePlugin({ include: /\\.vue/, vue: { include: /\\.${
          hasMarkdownFeature ? '(md|vue)' : 'vue'
        }/ }})`,
      ];
    case 'preact':
    case 'react':
      return [
        `preactMarkdownPlugin({ include: /\\.md/ })`,
        `preactPlugin({ include: /\\.${
          hasTypescriptFeature ? 'tsx' : 'jsx'
        }/ })`,
      ];
    default:
      return [];
  }
}

function getFrameworkPluginImports({ framework, hasMarkdownFeature = false }) {
  switch (framework) {
    case 'svelte':
      return [
        hasMarkdownFeature &&
          "import { svelteMarkdownPlugin } from '@vitebook/markdown-svelte/node';",
        "import sveltePreprocess from 'svelte-preprocess';",
      ];
    case 'vue':
      return [
        "import { vuePlugin } from '@vitebook/vue/node';",
        hasMarkdownFeature &&
          "import { vueMarkdownPlugin } from '@vitebook/markdown-vue/node';",
      ];
    case 'preact':
    case 'react':
      return [
        "import { preactPlugin } from '@vitebook/preact/node';",
        hasMarkdownFeature &&
          "import { preactMarkdownPlugin } from '@vitebook/markdown-preact/node';",
      ];
    default:
      return [];
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
