// @ts-check

import path from 'upath';
import { fileURLToPath } from 'url';

import { FileDirectory } from './FileDirectory.js';
import { GitIgnore } from './GitIgnore.js';
import { Package } from './Package.js';
import { getVersion } from './utils/version.js';

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
          svelte: new FileDirectory(resolveSrcPath('template-svelte')),
        },
      },
      dest: {
        root: new FileDirectory(targetDir),
        src: new FileDirectory(path.resolve(targetDir, 'src')),
        routes: new FileDirectory(path.resolve(targetDir, 'routes')),
      },
    };

    this.hooks = {
      /** @type {(() => void | Promise<void>)[]} */
      postBuild: [],
    };
  }

  /**
   * @param {import('./types').Feature} feature
   */
  hasFeature(feature) {
    return this.features.includes(feature);
  }

  /** @param {'postBuild'} name */
  async runHooks(name) {
    await Promise.all(this.hooks[name].map((fn) => fn()));
  }
}
