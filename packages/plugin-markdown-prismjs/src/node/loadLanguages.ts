import * as Prism from 'prismjs';
import rawLoadLanguages from 'prismjs/components/index';

rawLoadLanguages.silent = true;

export const loadLanguages = (languages: string[]): void => {
  const langsToLoad = languages.filter((item) => !Prism.languages[item]);
  if (langsToLoad.length) {
    rawLoadLanguages(langsToLoad);
  }
};
