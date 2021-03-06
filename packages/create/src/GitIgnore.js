// @ts-check

import fs from 'fs';
import path from 'upath';

export const GIT_IGNORE = [
  '.DS_STORE',
  '.cache',
  '.temp',
  'node_modules/',
  'dist/',
];

export class GitIgnore {
  /** @protected @readonly */
  gitIgnore = new Set(GIT_IGNORE);

  /**
   * @param {string} targetDir
   */
  constructor(targetDir) {
    /** @protected @readonly @type {string} */
    this.gitignorePath = path.resolve(targetDir, '.gitignore');
  }

  /**
   * @param {string} ignore
   */
  add(ignore) {
    this.gitIgnore.add(ignore);
  }

  save() {
    const ignore = Array.from(this.gitIgnore);
    const exists = fs.existsSync(this.gitignorePath);

    if (!exists) {
      fs.writeFileSync(this.gitignorePath, ignore.join('\n'));
    } else {
      let content = fs.readFileSync(this.gitignorePath).toString();

      ignore.forEach((ignore) => {
        if (!content.includes(ignore)) {
          content = content + '\n' + ignore;
        }
      });

      fs.writeFileSync(this.gitignorePath, content);
    }
  }
}
