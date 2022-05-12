// @ts-check

/**
 * @param {import('../ProjectBuilder').ProjectBuilder} builder
 */
export function addPrettierFeature(builder) {
  if (!builder.hasFeature('prettier')) return;

  builder.pkg.addDependency('npm-run-all', '^4.0.0', { dev: true });
  builder.pkg.addDependency('prettier', '^2.0.0', { dev: true });

  if (builder.hasFeature('typescript')) {
    builder.pkg.addDependency('prettier-plugin-tailwindcss', '^^0.1.7', {
      dev: true,
    });
  }

  builder.pkg.addScript('lint', 'run-s lint:*');
  builder.pkg.addScript(
    'lint:prettier',
    'prettier . --check --ignore-path .gitignore --loglevel warn',
  );

  builder.pkg.addScript('format', 'run-s format:*');
  builder.pkg.addScript('format:prettier', 'npm run lint:prettier -- --write');

  const config = {
    singleQuote: true,
    printWidth: 80,
    tabWidth: 2,
    trailingComma: 'all',
  };

  builder.dirs.dest.root.writeFile(
    '.prettierrc',
    JSON.stringify(config, null, 2),
  );
}
