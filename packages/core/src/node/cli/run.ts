/* eslint-disable @typescript-eslint/no-var-requires */

import { cac } from 'cac';

import { logger } from '../utils/logger';
import { esmRequire } from '../utils/module';
import { buildCommand } from './commands/buildCommand';
import { devCommand } from './commands/devCommand';
import { previewCommand } from './commands/previewCommand';

const program = cac('vitebook');

const vitebookCorePkg = esmRequire('@vitebook/core/package.json');
program.version(vitebookCorePkg.version);

program.help();

// Dev
program
  .command('dev [root]', 'Start development server')
  .option('--base <baseUrl>', '[string] Set public base path (default: /)')
  .option(
    '--srcDir <srcDir>',
    '[string] Set path to source code directory (default: src)',
  )
  .option(
    '--publicDir <publicDir>',
    '[string] Set path to public directory (default: .vitebook/public)',
  )
  .option(
    '--cacheDir <cacheDir>',
    '[string] Set path to cache directory (default: .vitebook/.cache)',
  )
  .option(
    '-c, --configDir <configDir>',
    '[string] Set path to config directory (default: .vitebook)',
  )
  .option(
    '--include <globs>',
    '[string] Specify globs to filter files to be included (example: "**/*.md,**/*.vue")',
  )
  .option('--https', '[boolean] Use TLS + HTTP/2')
  .option('--host [host]', '[string] Use specified host (default: 0.0.0.0)')
  .option('-p, --port [port]', '[number] Use specified port (default: 8080)')
  .option('--cors', '[boolean] Enable CORS')
  .option('--strictPort', '[boolean] Exit if specified port is already in use')
  .option('--open [path]', '[boolean | string] Open browser on startup')
  .option('-d, --debug', '[boolean] Enable debug mode')
  .option('--clearScreen', '[boolean] Allow/disable clear screen when logging')
  .option('-m, --mode', '[string] Set env mode')
  .action(function runDevCommand(root, options) {
    options.root = root;
    options.baseUrl = options.base;
    options.include = options.include?.split(',');
    options.configDir = options.configDir ?? options.c;
    options.port = options.port ?? options.p;
    options.debug = options.debug ?? options.d;
    options.mode = options.mode ?? options.m;
    devCommand({
      command: 'dev',
      ...options,
    }).catch((err) => {
      logger.error('\n', err, '\n');
      process.exit(1);
    });
  });

// Build
program
  .command('build [root]', 'Build to static site')
  .option('--target <target>', '[string] Transpile target (default: "modules")')
  .option('--base <baseUrl>', '[string] Set public base path (default: /)')
  .option(
    '--srcDir <srcDir>',
    '[string] Set path to source code directory (default: src)',
  )
  .option(
    '--publicDir <publicDir>',
    '[string] Set path to public directory (default: .vitebook/public)',
  )
  .option(
    '--cacheDir <cacheDir>',
    '[string] Set path to cache directory (default: .vitebook/.cache)',
  )
  .option(
    '-c, --configDir <configDir>',
    '[string] Set path to config directory (default: .vitebook)',
  )
  .option('--outDir <dir>', '[string] Output directory (default: dist)')
  .option(
    '--emptyOutDir',
    "[boolean] Force empty `outDir` when it's outside of root",
  )
  .option(
    '--assetsDir <dir>',
    '[string] Directory under outDir to place assets in (default: _assets)',
  )
  .option(
    'assetsInlineLimit',
    '[number] Static asset `base64` inline threshold in bytes (default: 4096)',
  )
  .option(
    '--include <globs>',
    '[string] Specify globs to filter files to be included (example: "**/*.md,**/*.vue")',
  )
  .option(
    '--sourcemap',
    '[boolean] Output source maps for build (default: false)',
  )
  .option(
    '--minify [minifier]',
    '[boolean | "terser" | "esbuild"] Enable/disable minification, or specify minifier to use (default: terser)',
  )
  .option('-m, --mode', '[string] Set env mode')
  .option('-w, --watch', '[boolean] Rebuilds when modules have changed on disk')
  .option('-d, --debug', '[boolean] Enable debug mode')
  .action(function runBuildCommand(root, options) {
    options.root = root;
    options.baseUrl = options.base;
    options.include = options.include?.split(',');
    options.configDir = options.configDir ?? options.c;
    options.watch = options.watch ?? options.w;
    options.mode = options.mode ?? options.m;
    options.debug = options.debug ?? options.d;
    buildCommand({
      command: 'build',
      ...options,
    }).catch((err) => {
      logger.error('\n', err, '\n');
      process.exit(1);
    });
  });

// Preview
program
  .command('preview [root]', 'Preview production build')
  .option('--base <baseUrl>', '[string] Set public base path (default: /)')
  .option(
    '-c, --configDir <configDir>',
    '[string] Set path to config directory (default: .vitebook)',
  )
  .option('--https', '[boolean] Use TLS + HTTP/2')
  .option('--host [host]', '[string] Use specified host (default: 0.0.0.0)')
  .option('-p, --port [port]', '[number] Use specified port (default: 8080)')
  .option('--cors', '[boolean] Enable CORS')
  .option('--strictPort', '[boolean] Exit if specified port is already in use')
  .option('--open [path]', '[boolean | string] Open browser on startup')
  .option('-m, --mode', '[string] Set env mode')
  .option('-d, --debug', '[boolean] Enable debug mode')
  .action(function runPreviewCommand(root, options) {
    options.root = root;
    options.baseUrl = options.base;
    options.configDir = options.configDir ?? options.c;
    options.port = options.port ?? options.p;
    options.mode = options.mode ?? options.m;
    options.debug = options.debug ?? options.d;
    previewCommand({
      command: 'preview',
      ...options,
    }).catch((err) => {
      logger.error('\n', err, '\n');
      process.exit(1);
    });
  });

program.parse(process.argv);
