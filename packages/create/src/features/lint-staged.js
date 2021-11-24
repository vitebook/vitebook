// @ts-check

import fs from 'fs';

import { getLintExtensions } from './eslint.js';

/**
 * @param {import('../ProjectBuilder').ProjectBuilder} builder
 */
export function addLintStagedFeature(builder) {
  if (!builder.hasFeature('lint-staged')) return;

  builder.pkg.addDependency('husky', '^7.0.0', { dev: true });
  builder.pkg.addDependency('lint-staged', '^11.0.0', { dev: true });

  const prepareScript = builder.pkg.getScript('prepare');

  if (prepareScript && !prepareScript.includes('husky install')) {
    builder.pkg.addScript('prepare', `${prepareScript} husky install`, {
      overwrite: true,
    });
  } else if (!prepareScript) {
    builder.pkg.addScript('prepare', `husky install`);
  }

  const lintStaged = builder.pkg['lint-staged'] ?? {};
  const lintExts = getLintExtensions(builder);

  builder.pkg.addField('lint-staged', lintStaged);

  if (builder.hasFeature('eslint')) {
    const glob = `*.{${lintExts.map((s) => s.slice(1)).join(',')}}`;
    lintStaged[glob] = 'eslint --cache --fix';
  }

  if (builder.hasFeature('prettier')) {
    const glob = `*.{${[...lintExts.map((s) => s.slice(1)), 'md', 'json'].join(
      ',',
    )}}`;
    lintStaged[glob] = 'prettier --write';
  }

  const huskyConfigDir = builder.dirs.dest.root.resolve('.husky');
  const huskyPreCommitFilePath =
    builder.dirs.dest.root.resolve('.husky/pre-commit');

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
