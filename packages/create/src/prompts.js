// @ts-check

import enquirer from 'enquirer';

import { FEATURES, FRAMEWORKS, THEMES } from './constants.js';

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
 *  showTemplatePrompt: boolean;
 *  showThemePrompt: boolean;
 *  showFeaturesPrompt: boolean;
 * }} options
 *
 * @returns {Promise<{
 *  projectName: string;
 *  projectDescription: string;
 *  template: string;
 *  theme?: string;
 *  features: string[],
 * }>}
 */
export function setupPrompt({
  initialProjectName,
  showTemplatePrompt,
  showThemePrompt,
  showFeaturesPrompt,
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
          initial: 2,
          choices: THEMES,
        },
        showFeaturesPrompt && {
          type: 'multiselect',
          name: 'features',
          message: 'Features:',
          choices: FEATURES,
        },
      ].filter(Boolean)
    ),
  );
}
