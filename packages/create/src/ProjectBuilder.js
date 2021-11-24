// @ts-check

import path from 'upath';
import { fileURLToPath } from 'url';

import { FileDirectory } from './FileDirectory.js';
import { GitIgnore } from './GitIgnore.js';
import { Package } from './Package.js';
import { getVersion } from './utils/getVersion.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class ProjectBuilder {
  /** @readonly */
  version = getVersion();

  /**
   * @param {{
   *  targetDir: string;
   *  link?: string;
   *  workspace: boolean;
   *  framework: import('./types').Framework;
   *  theme: import('./types').Theme;
   *  features: import('./types').Feature[];
   * }} config
   */
  constructor({ targetDir, link, workspace, framework, theme, features }) {
    /** @protected @readonly @type {string} */
    this.targetDir = targetDir;

    /** @readonly @type {import('./types').Framework} */
    this.framework = framework;
    /** @readonly @type {import('./types').Theme} */
    this.theme = theme;
    /** @protected @readonly @type {import('./types').Feature[]} */
    this.features = features;

    const resolveSrcPath = (...pathSegments) =>
      path.resolve(__dirname, '../', ...(pathSegments ?? []));

    /** @readonly @type {Package} */
    this.pkg = new Package(targetDir, { workspace, link });
    /** @readonly @type {GitIgnore} */
    this.gitIgnore = new GitIgnore(targetDir);

    /** @readonly */
    this.dirs = {
      src: {
        root: new FileDirectory(resolveSrcPath()),
        template: {
          root: new FileDirectory(resolveSrcPath('template-root')),
          vue: new FileDirectory(resolveSrcPath('template-vue')),
          svelte: new FileDirectory(resolveSrcPath('template-svelte')),
          preact: new FileDirectory(resolveSrcPath('template-preact')),
          theme: {
            blank: new FileDirectory(resolveSrcPath('template-theme-blank')),
            custom: new FileDirectory(resolveSrcPath('template-theme-custom')),
          },
        },
      },
      dest: {
        root: new FileDirectory(targetDir),
        src: new FileDirectory(path.resolve(targetDir, 'src')),
        config: new FileDirectory(path.resolve(targetDir, '.vitebook')),
        theme: new FileDirectory(path.resolve(targetDir, '.vitebook', 'theme')),
      },
    };
  }

  /**
   * @param {import('./types').Feature} feature
   */
  hasFeature(feature) {
    return this.features.includes(feature);
  }
}
