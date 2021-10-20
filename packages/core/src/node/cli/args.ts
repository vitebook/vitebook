export type DevCommandArgs = {
  '--': string[];
  command: string;
  root?: string;
  srcDir?: string;
  baseUrl?: string;
  publicDir?: string;
  cacheDir?: string;
  configDir?: string;
  tmpDir?: string;
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
  srcDir?: string;
  baseUrl?: string;
  publicDir?: string;
  cacheDir?: string;
  configDir?: string;
  tmpDir?: string;
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

export type PreviewCommandArgs = {
  '--': string[];
  command: string;
  root?: string;
  baseUrl?: string;
  configDir?: string;
  tmpDir?: string;
  https?: boolean;
  host?: string;
  port?: number;
  cors?: boolean;
  strictPort?: boolean;
  open?: boolean | string;
  mode?: string;
  debug?: boolean;
};

export type CLIArgs = DevCommandArgs & BuildCommandArgs & PreviewCommandArgs;
