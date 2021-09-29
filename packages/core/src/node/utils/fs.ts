import { createHash } from 'crypto';
import globby from 'fast-glob';
import * as fsExtra from 'fs-extra';

// eslint-disable-next-line import/namespace
const fs = fsExtra['default'] as typeof fsExtra;

export { fs, globby };

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
