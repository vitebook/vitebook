// @ts-check

/**
 * @param {import('../ProjectBuilder').ProjectBuilder} builder
 */
export function addEslintFeature(builder) {
  if (!builder.hasFeature('eslint')) return;

  builder.gitIgnore.add('.eslintcache');

  builder.pkg.addDependency('npm-run-all', '^4.0.0', { dev: true });
  builder.pkg.addDependency('eslint', '^7.0.0', { dev: true });
  builder.pkg.addDependency('eslint-plugin-import', '^2.0.0', { dev: true });
  builder.pkg.addDependency('eslint-plugin-simple-import-sort', '^7.0.0', {
    dev: true,
  });

  builder.pkg.addScript('lint', 'run-s lint:*');

  const lintExts = getLintExtensions(builder);
  builder.pkg.addScript(
    'lint:eslint',
    `eslint --ext ${lintExts.join(',')} . --ignore-path .gitignore`,
  );

  builder.pkg.addScript('format', 'run-s format:*');
  builder.pkg.addScript('format:eslint', 'npm run lint:eslint -- --fix');

  if (builder.hasFeature('prettier')) {
    builder.pkg.addDependency('eslint-config-prettier', '^8.0.0', {
      dev: true,
    });
  }

  if (builder.hasFeature('typescript')) {
    builder.pkg.addDependency('@typescript-eslint/eslint-plugin', '^4.0.0', {
      dev: true,
    });
    builder.pkg.addDependency('@typescript-eslint/parser', '^4.0.0', {
      dev: true,
    });
    builder.pkg.addDependency('eslint-import-resolver-typescript', '^2.5.0', {
      dev: true,
    });
  }

  // if (builder.framework === 'vue') {
  //   builder.pkg.addDependency('eslint-plugin-vue', '^8.0.0', {
  //     dev: true,
  //   });
  // }

  if (builder.framework === 'svelte') {
    builder.pkg.addDependency('eslint-plugin-svelte3', '^3.0.0', {
      dev: true,
    });
  }

  const config = JSON.stringify(
    getEslintConfig(builder.framework, {
      typescript: builder.hasFeature('typescript'),
      prettier: builder.hasFeature('prettier'),
    }),
    null,
    2,
  );

  builder.dirs.dest.root.writeFile(
    '.eslintrc.js',
    `module.exports = ${config};`,
  );
}

/**
 * @param {import('../types').Framework} framework
 */
export function getEslintConfig(
  framework,
  { typescript = false, prettier = false },
) {
  const config =
    // (framework === 'preact' && getPreactEslintConfig({ typescript })) ||
    (framework === 'svelte' && getSvelteEslintConfig({ typescript })) ||
    getVueEslintConfig({ typescript });

  if (prettier) config.plugins.push('prettier');

  return config;
}

export function getBaseEslintConfig({ typescript = false }) {
  return {
    env: {
      browser: true,
      es6: true,
      node: true,
    },
    parserOptions: {
      project: typescript ? './tsconfig.json' : undefined,
      parser: typescript ? '@typescript-eslint/parser' : undefined,
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    ignorePatterns: ['.eslintrc.js'],
    plugins: [typescript && '@typescript-eslint', 'simple-import-sort'].filter(
      Boolean,
    ),
    overrides: /** @type {({ files: string[]; processor: string; })[]} */ ([]),
    extends: [
      'eslint:recommended',
      typescript && 'plugin:@typescript-eslint/recommended',
      'plugin:import/recommended',
      typescript && 'plugin:import/typescript',
    ].filter(Boolean),
    rules: {
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': 'error',
    },
    settings: {
      'import/resolver': typescript ? { typescript: {} } : undefined,
    },
  };
}

export function getVueEslintConfig({ typescript = false }) {
  const config = getBaseEslintConfig({ typescript });
  config.parser = 'vue-eslint-parser';
  config.extends.push('plugin:vue/vue3-recommended');
  return config;
}

export function getSvelteEslintConfig({ typescript = false }) {
  const config = getBaseEslintConfig({ typescript });

  config.plugins.unshift('svelte3');

  config.overrides.push({
    files: ['*.svelte'],
    processor: 'svelte3/svelte3',
  });

  if (typescript) {
    config.settings['svelte3/typescript'] = true;
  }

  return config;
}

export function getPreactEslintConfig({ typescript = false }) {
  return getBaseEslintConfig({ typescript });
}

/**
 * @param {import('../ProjectBuilder').ProjectBuilder} builder
 * @returns {string[]}
 */
export function getLintExtensions(builder) {
  const supportsJsx = /(vue|preact)/.test(builder.framework);
  const withTypescript = builder.hasFeature('typescript');

  return /** @type {string[]} */ (
    [
      '.js',
      supportsJsx && '.jsx',
      withTypescript && '.ts',
      supportsJsx && withTypescript && '.tsx',
      // builder.framework === 'vue' && '.vue',
      builder.framework === 'svelte' && '.svelte',
    ].filter(Boolean)
  );
}
