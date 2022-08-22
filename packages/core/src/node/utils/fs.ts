import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';

export const isTypeScriptFile = (filePath: string): boolean =>
  /\.(ts|tsx)($|\?)/.test(filePath);

export const isCommonJsFile = (filePath: string): boolean =>
  /\.cjs($|\?)/.test(filePath);

/**
 * vitejs/vite#610 when hot-reloading files, if we read immediately on the file change event
 * it can be too early and we sometimes get an empty buffer. Poll until the file's modified time
 * has changed before reading again.
 */
export async function readRecentlyChangedFile(file: string): Promise<string> {
  const content = fs.readFileSync(file, 'utf-8');

  if (!content) {
    const mtime = fs.statSync(file).mtimeMs;

    await new Promise((r) => {
      let n = 0;

      const poll = async () => {
        n++;
        const newMtime = fs.statSync(file).mtimeMs;
        if (newMtime !== mtime || n > 10) {
          r(0);
        } else {
          setTimeout(poll, 10);
        }
      };

      setTimeout(poll, 10);
    });

    return fs.readFileSync(file, 'utf-8');
  } else {
    return content;
  }
}

export function checksumFile(algorithm: string, path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash(algorithm);
    const stream = fs.createReadStream(path);
    stream.on('error', (err) => reject(err));
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

export async function ensureDir(dir: string) {
  if (fs.existsSync(dir)) return;
  await fs.promises.mkdir(dir, { recursive: true });
}

export async function ensureFile(filePath: string) {
  if (fs.existsSync(filePath)) return;
  await ensureDir(path.dirname(filePath));
  await fs.promises.writeFile(filePath, '', { encoding: 'utf-8' });
}

export function copyDir(srcDir: string, destDir: string) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    copyFile(srcFile, destFile);
  }
}

export function copyFile(src: string, dest: string) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
}

export async function emptyDir(dir: string) {
  await fs.promises.rm(dir, { recursive: true, force: true });
  await fs.promises.mkdir(dir);
}

export function mkdirp(dir: string) {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((e as any).code === 'EEXIST') return;
    throw e;
  }
}

export function rimraf(path: string) {
  fs.rmSync(path, { force: true, recursive: true });
}
