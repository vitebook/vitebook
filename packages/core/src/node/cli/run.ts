/* eslint-disable @typescript-eslint/no-var-requires */

import { cac, Command } from 'cac';

import { logger } from '../utils/logger';
import { esmRequire } from '../utils/module';
import { buildCommand } from './commands/buildCommand';
import { devCommand } from './commands/devCommand';
import { previewCommand } from './commands/previewCommand';

export * from './args';

const addBaseOptions = (command: Command) =>
  command
    .option(
      '--cwd <dir>',
      '[string] Set path to working directory (default: process.cwd())',
    )
    .option(
      '--pages <dir>',
      '[string] Set path to pages directory (default: <root>/pages)',
    )
    .option(
      '--public <dir>',
      '[string] Set path to public directory (default: <root>/public)',
    )
    .option(
      '--include <globs>',
      '[string] Specify globs to filter pages to be included (example: "**/*.md,**/*.svelte")',
    );

const addServerOptions = (command: Command) =>
  command
    .option('--host [host]', `[string] Specify hostname`)
    .option('--port <port>', `[number] Specify port`)
    .option('--https', `[boolean] Use TLS + HTTP/2`)
    .option('--open [path]', `[boolean | string] Open browser on startup`)
    .option(
      '--strictPort',
      `[boolean] Exit if specified port is already in use`,
    );

export function cliRun() {
  const program = cac('vitebook');

  const vitebookCorePkg = esmRequire('@vitebook/core/package.json');
  program.version(vitebookCorePkg.version);

  program.help();
  // Dev
  addServerOptions(
    addBaseOptions(
      program.command('dev [root]', 'Start development server'),
    ).option('-d, --debug', '[boolean] Enable debug mode'),
  ).action(function runDevCommand(root, options) {
    devCommand({
      command: 'dev',
      root,
      ...options,
      include: options.include?.split(','),
    }).catch((err) => {
      logger.error('\n', err, '\n');
      process.exit(1);
    });
  });

  // Build
  addBaseOptions(program.command('build [root]', 'Build to static site'))
    .option(
      '--output <dir>',
      '[string] Output directory (default: <cwd>/build)',
    )
    .option('-d, --debug', '[boolean] Enable debug mode')
    .action(function runBuildCommand(root, options) {
      buildCommand({
        command: 'build',
        root,
        ...options,
        include: options.include?.split(','),
      }).catch((err) => {
        logger.error('\n', err, '\n');
        process.exit(1);
      });
    });

  // Preview
  addServerOptions(
    program
      .command('preview [root]', 'Preview production build')
      .option(
        '--cwd <dir>',
        '[string] Set path to working directory (default: process.cwd())',
      ),
  ).action(function runPreviewCommand(root, options) {
    previewCommand({
      command: 'preview',
      root,
      ...options,
    }).catch((err) => {
      logger.error('\n', err, '\n');
      process.exit(1);
    });
  });

  program.parse(process.argv);
}
