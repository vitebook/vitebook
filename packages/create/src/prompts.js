// @ts-check

import enquirer from 'enquirer';

import { FEATURES, FRAMEWORKS, THEMES } from './constants.js';
import { isValidPackageName } from './utils/pkg.js';

/**
 * @returns {Promise<{ overwrite: boolean }>}
 */
export function overwritePrompt() {
  return enquirer.prompt({
    type: 'confirm',
    name: 'overwrite',
    message: `Directory exists. Overwrite?`,
    initial: false,
  });
}

/**
 * @param {{
 *  initialProjectName?: string ;
 *  initialPackageName: string;
 *  showPackageNamePrompt: boolean;
 *  showTemplatePrompt: boolean;
 *  showThemePrompt: boolean;
 *  showFeaturesPrompt: boolean;
 *  showOverwriteConfigPrompt: boolean;
 * }} options
 *
 * @returns {Promise<{
 *  projectName: string;
 *  projectDescription: string;
 *  packageName: string;
 *  template: string;
 *  theme?: string;
 *  features: string[],
 *  overwrite?: boolean
 * }>}
 */
export function setupPrompt({
  initialProjectName,
  initialPackageName,
  showPackageNamePrompt,
  showTemplatePrompt,
  showThemePrompt,
  showFeaturesPrompt,
  showOverwriteConfigPrompt,
}) {
  return enquirer.prompt(
    /** @type {any} */ (
      [
        {
          type: 'input',
          name: 'projectName',
          message: 'Project Name:',
          initial: initialProjectName,
        },
        {
          type: 'input',
          name: 'projectDescription',
          message: 'Project Description:',
          initial: '',
        },
        showPackageNamePrompt && {
          type: 'input',
          name: 'packageName',
          message: 'Package Name:',
          initial: initialPackageName,
          validate: (name) =>
            isValidPackageName(name) ||
            'Invalid package name (https://docs.npmjs.com/cli/v7/configuring-npm/package-json#name)',
        },
        showTemplatePrompt && {
          type: 'select',
          name: 'template',
          message: 'Select a framework:',
          initial: 0,
          choices: FRAMEWORKS,
        },
        showThemePrompt && {
          type: 'select',
          name: 'theme',
          message: 'Select a theme:',
          initial: 0,
          choices: THEMES,
        },
        showFeaturesPrompt && {
          type: 'multiselect',
          name: 'features',
          message: 'Features:',
          choices: FEATURES,
        },
        showOverwriteConfigPrompt && {
          type: 'confirm',
          name: 'overwrite',
          message: `\`.vitebook\` directory exists, overwrite?`,
          initial: false,
        },
      ].filter(Boolean)
    ),
  );
}
