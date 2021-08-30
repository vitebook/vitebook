import type { AppOptions } from '../app/AppOptions.js';

export type CLIArgs = Partial<
  Pick<AppOptions, 'baseUrl' | 'srcDir' | 'publicDir' | 'pages'>
> & {
  [argName: string]: unknown;

  /**
   * The current working directory. The path can be absolute or a path relative to the
   * current working directory `process.cwd()`.
   *
   * @default process.cwd()
   */
  cwd?: string;

  /**
   * Project root directory. The path can be absolute, or a path relative to the current
   * working directory `process.cwd()`.
   *
   * @default '.storyboard'
   */
  project?: string;

  /**
   * Path to the configuration file. The path can be absolute, or a path relative to
   * the current working directory `process.cwd()`.
   *
   * @default '<project>/config.{js,mjs}'
   */
  config?: string;

  /**
   * Whether to load the app in debug mode so logs are printed to the console.
   *
   * @default false
   */
  debug?: string;
};
