// @ts-check

import fs from 'fs';
import path from 'upath';

import { getVersion } from './utils/getVersion.js';
import { sortObjectKeys } from './utils/sortObjectKeys.js';

export class Package {
  /** @protected @type {Record<string, any>} */
  pkg = {};

  /**
   * @param {string} targetDir
   * @param {{
   *  workspace?: boolean;
   *  link?: string;
   * }} options
   */
  constructor(targetDir, { workspace, link }) {
    /** @protected @readonly @type {string} */
    this.pkgPath = path.resolve(targetDir, 'package.json');
    /** @protected @readonly @type {boolean|undefined} */
    this.workspace = workspace;
    /** @protected @readonly @type {string|undefined} */
    this.link = link;

    /** @type {import('./types').PackageManager} @readonly */
    this.manager =
      /** @type {import('./types').PackageManager} */ (
        this.getPkgInfoFromUserAgent()?.name
      ) ?? 'npm';

    this.read();
  }

  /** @protected */
  read() {
    this.pkg = fs.existsSync(this.pkgPath)
      ? JSON.parse(fs.readFileSync(this.pkgPath).toString())
      : { name: '', description: '', version: '0.0.0', type: 'module' };

    this.pkg.scripts = this.pkg.scripts ?? {};
    this.pkg.dependencies = this.pkg.dependencies ?? {};
    this.pkg.devDependencies = this.pkg.devDependencies ?? {};
  }

  /**
   * @param {string} key
   * @param {any} value
   */
  addField(key, value, { overwrite = false } = {}) {
    if (!this.pkg[key] || overwrite) {
      this.pkg[key] = value;
    }
  }

  /**
   * @param {string} name
   */
  hasScriptName(name) {
    return Object.keys(this.pkg.scripts).some(
      (scriptName) => scriptName === name,
    );
  }

  /**
   * @param {RegExp} regex
   */
  hasScript(regex) {
    return Object.values(this.pkg.scripts).some((script) => regex.test(script));
  }

  /**
   * @param {string} name
   * @returns {string|undefined}
   */
  getScript(name) {
    return this.pkg.scripts[name];
  }

  /**
   * @param {string} name
   * @param {string} script
   * @param {{ overwrite?: boolean; regexTest?: RegExp }} [options]
   */
  addScript(name, script, { regexTest, overwrite = false } = {}) {
    if (
      (overwrite || !this.hasScriptName(name)) &&
      (!regexTest || !this.hasScript(regexTest))
    ) {
      this.pkg.scripts[name] = script;
    }
  }

  /**
   * @param {string} name
   * @param {string} [version]
   */
  addDependency(name, version, { dev = false, overwrite = false } = {}) {
    const deps = this.pkg[dev ? 'devDependencies' : 'dependencies'];
    if (overwrite || !deps[name]) {
      deps[name] = version;
    }
  }

  /**
   * @param {string} name
   */
  addVitebookDependency(name) {
    const version = this.workspace ? 'workspace:*' : `^${getVersion()}`;
    this.pkg.devDependencies[`@vitebook/${name}`] = this.link
      ? `${this.manager === 'yarn' ? 'link:' : ''}${this.link}/${name}`
      : version;
  }

  save() {
    this.pkg.scripts = sortObjectKeys(this.pkg.scripts);
    this.pkg.dependencies = sortObjectKeys(this.pkg.dependencies);
    this.pkg.devDependencies = sortObjectKeys(this.pkg.devDependencies);

    fs.writeFileSync(this.pkgPath, JSON.stringify(this.pkg, null, 2));
  }

  /** @protected */
  getPkgInfoFromUserAgent() {
    const userAgent = process.env.npm_config_user_agent;
    if (!userAgent) return undefined;
    const pkgSpec = userAgent.split(' ')[0];
    const pkgSpecArr = pkgSpec.split('/');
    return {
      name: pkgSpecArr[0],
      version: pkgSpecArr[1],
    };
  }
}
