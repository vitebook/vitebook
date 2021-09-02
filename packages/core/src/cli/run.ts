/* eslint-disable @typescript-eslint/no-var-requires */

import { cac } from 'cac';

import { logger } from '../utils/logger.js';
import { esmRequire } from '../utils/module.js';
import { buildCommand } from './commands/buildCommand.js';
import { devCommand } from './commands/devCommand.js';
import { serveCommand } from './commands/serveCommand.js';

const program = cac('vitebook');

const vitebookCorePkg = esmRequire('@vitebook/core/package.json');
program.version(vitebookCorePkg.version);

program.help();

// Dev
program
  .command('dev [srcDir]', 'Start development server')
  .option(
    '--cwd <cwd>',
    '[string] Set path to current working directory (default: .)'
  )
  .option('--base <baseUrl>', '[string] Set public base path (default: /)')
  .option(
    '--publicDir <publicDir>',
    '[string] Set path to public directory (default: .vitebook/public)'
  )
  .option(
    '--cacheDir <cacheDir>',
    '[string] Set path to cache directory (default: .vitebook/.cache)'
  )
  .option(
    '-c, --configDir <configDir>',
    '[string] Set path to config directory (default: .vitebook)'
  )
  .option(
    '--pages <globs>',
    '[string] Specify globs to filter pages included relative to <srcDir> (example: "**/*.md,**/*.stories.ts")'
  )
  .option('--https', '[boolean] Use TLS + HTTP/2')
  .option('--host <host>', '[string] Use specified host (default: 0.0.0.0)')
  .option('-p, --port <port>', '[number] Use specified port (default: 8080)')
  .option('--cors', '[boolean] Enable CORS')
  .option('--strictPort', '[boolean] Exit if specified port is already in use')
  .option('--open [path]', '[boolean | string] Open browser on startup')
  .option('-d, --debug', '[boolean] Enable debug mode')
  .option('--clearScreen', '[boolean] Allow/disable clear screen when logging')
  .option('-m, --mode', '[string] Set env mode')
  .action(function runDevCommand(srcDir, options) {
    options.srcDir = srcDir;
    options.baseUrl = options.base;
    options.pages = options.page?.split(',');
    devCommand({
      command: 'dev',
      ...options
    }).catch((err) => {
      logger.error('\n', err, '\n');
      process.exit(1);
    });
  });

// Build
program
  .command('build [srcDir]', 'Build to static site')
  .action(function runBuildCommand(srcDir, options) {
    options.srcDir = srcDir;
    buildCommand({
      command: 'build',
      ...options
    }).catch((err) => {
      logger.error('\n', err, '\n');
      process.exit(1);
    });
  });

// Serve
program
  .command('serve [dir]', 'Serve production build')
  .action(function runServeCommand(dir, options) {
    options.dir = dir;
    serveCommand({
      command: 'serve',
      ...options
    }).catch((err) => {
      logger.error('\n', err, '\n');
      process.exit(1);
    });
  });

program.parse(process.argv);
