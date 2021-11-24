// @ts-check

import fs from 'fs';

export function isDirEmpty(path) {
  if (!fs.existsSync(path)) {
    return true;
  }

  return fs.readdirSync(path).length === 0;
}
