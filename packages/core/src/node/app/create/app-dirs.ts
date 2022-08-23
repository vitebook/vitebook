import fs from 'fs';
import path from 'upath';
import { searchForWorkspaceRoot } from 'vite';

import type { AppDirectories, Directory } from '../App';
import type { ResolvedAppConfig } from '../config';

export function createAppDirectories(
  root: string,
  config: ResolvedAppConfig,
): AppDirectories {
  const cwdDir = createDirectory(process.cwd());
  const rootDir = createDirectory(root);
  const workspaceDir = createDirectory(
    searchForWorkspaceRoot(cwdDir.path, rootDir.path),
  );
  const appDir = createDirectory(config.dirs.app);
  const outDir = createDirectory(config.dirs.output);
  const publicDir = createDirectory(config.dirs.public);
  const tmpDir = createDirectory(cwdDir.resolve('node_modules/.vitebook/temp'));
  return {
    cwd: cwdDir,
    workspace: workspaceDir,
    root: rootDir,
    app: appDir,
    out: outDir,
    public: publicDir,
    tmp: tmpDir,
  };
}

function createDirectory(baseDir: string): Directory {
  const resolve = (...args: string[]) =>
    args.length === 1 && path.isAbsolute(args[0])
      ? args[0]
      : path.resolve(baseDir, ...args);

  const relative = (...args: string[]) =>
    path.relative(baseDir, path.join(...args));

  const read = (filePath: string) =>
    fs.readFileSync(resolve(filePath), 'utf-8');

  const write = (filePath: string, data: string) =>
    fs.writeFileSync(resolve(filePath), data);

  return {
    path: baseDir,
    resolve,
    relative,
    read,
    write,
  };
}
