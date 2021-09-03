export type DevCommandArgs = {
  '--': string[];
  command: string;
  cwd?: string;
  srcDir?: string;
  baseUrl?: string;
  publicDir?: string;
  cacheDir?: string;
  configDir?: string;
  pages?: string[];
  https?: boolean;
  host?: string;
  port?: number;
  cors?: boolean;
  strictPort?: boolean;
  open?: boolean | string;
  clearScreen?: boolean;
  mode?: string;
  debug?: boolean;
};

export type BuildCommandArgs = {
  '--': string[];
  command: string;
  target?: string;
  ssr?: boolean;
  cwd?: string;
  srcDir?: string;
  baseUrl?: string;
  publicDir?: string;
  cacheDir?: string;
  configDir?: string;
  outDir?: string;
  emptyOutDir?: boolean;
  assetsDir?: string;
  assetsInlineLimit?: number;
  pages?: string[];
  sourcemap?: boolean;
  minify?: boolean | 'terser' | 'esbuild';
  mode?: string;
  watch?: boolean;
  debug?: boolean;
};

export type ServeCommandArgs = {
  '--': string[];
  command: string;
  root?: string;
  baseUrl?: string;
  cwd?: string;
  configDir?: string;
  https?: boolean;
  host?: string;
  port?: number;
  cors?: boolean;
  strictPort?: boolean;
  open?: boolean | string;
  mode?: string;
  debug?: boolean;
};

export type CLIArgs = DevCommandArgs & BuildCommandArgs & ServeCommandArgs;
