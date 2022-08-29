// @ts-check

import fs from 'node:fs';
import path from 'upath';

export function emptyDir(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  for (const file of fs.readdirSync(dir)) {
    const abs = path.resolve(dir, file);
    // baseline is Node 12 so can't use rmSync :(
    if (fs.lstatSync(abs).isDirectory()) {
      emptyDir(abs);
      fs.rmdirSync(abs);
    } else {
      fs.unlinkSync(abs);
    }
  }
}

/**
 * @param {string} srcDir
 * @param {string} destDir
 */
export function copyDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    copyFile(srcFile, destFile);
  }
}

/**
 * @param {string} src
 * @param {string} dest
 * @param {{
 *  replace?: Record<string, string>;
 * }} [options]
 */
export function copyFile(src, dest, { replace } = {}) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    if (replace) {
      let content = fs.readFileSync(src, 'utf-8');
      fs.writeFileSync(dest, replaceTemplateStrings(content, replace));
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}

/**
 * @param {string} content
 * @param {Record<string, string>} replace
 */
export function replaceTemplateStrings(content, replace) {
  Object.keys(replace).forEach((find) => {
    content = content.replace(new RegExp(find, 'g'), replace[find]);
  });

  return content;
}

export function isDirEmpty(path) {
  if (!fs.existsSync(path)) {
    return true;
  }

  return fs.readdirSync(path).length === 0;
}
