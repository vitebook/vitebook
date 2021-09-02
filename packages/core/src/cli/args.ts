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
  debug?: boolean;
  clearScreen?: boolean;
  mode?: string;
};

export type BuildCommandArgs = {
  '--': string[];
  command: string;
};

export type ServeCommandArgs = {
  '--': string[];
  command: string;
};

export type CLIArgs = DevCommandArgs & BuildCommandArgs & ServeCommandArgs;
