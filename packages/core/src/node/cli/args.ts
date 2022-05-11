export type DevCommandArgs = {
  '--': string[];
  command: string;
  cwd?: string;
  root?: string;
  pages?: string;
  public?: string;
  include?: string[];
  debug?: boolean;
  host?: string;
  port?: number;
  https?: boolean;
  open?: boolean | string;
  cors?: boolean;
  strictPort?: boolean;
};

export type BuildCommandArgs = {
  '--': string[];
  command: string;
  cwd?: string;
  root?: string;
  pages?: string;
  public?: string;
  output?: string;
  include?: string[];
  debug?: boolean;
};

export type PreviewCommandArgs = {
  '--': string[];
  command: string;
  cwd?: string;
  root?: string;
  host?: string;
  port?: number;
  https?: boolean;
  open?: boolean | string;
  strictPort?: boolean;
};

export type CLIArgs = DevCommandArgs & BuildCommandArgs & PreviewCommandArgs;
