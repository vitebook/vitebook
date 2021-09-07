export type DevCommandArgs = {
  '--': string[];
  command: string;
  root?: string;
  baseUrl?: string;
  publicDir?: string;
  cacheDir?: string;
  configDir?: string;
  include?: string[];
  exclude?: string[];
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
  root?: string;
  baseUrl?: string;
  publicDir?: string;
  cacheDir?: string;
  configDir?: string;
  outDir?: string;
  emptyOutDir?: boolean;
  assetsDir?: string;
  assetsInlineLimit?: number;
  include?: string[];
  exclude?: string[];
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
