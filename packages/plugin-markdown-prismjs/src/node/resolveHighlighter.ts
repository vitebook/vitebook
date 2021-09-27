// eslint-disable-next-line import/default
import prism from 'prismjs';

import { loadLanguages } from './loadLanguages';

// eslint-disable-next-line import/no-named-as-default-member
const { languages, highlight } = prism;

const languageNameMap = {
  html: 'markup',
  vue: 'markup'
};

const docLangMap = {
  csharp: 'xml-doc',
  fsharp: 'xml-doc',
  java: 'javadoc',
  javascript: 'jsdoc',
  php: 'phpdoc',
  typescript: 'jsdoc'
};

export type Highlighter = (code: string) => string;

/**
 * Resolve syntax highlighter for corresponding language.
 */
export const resolveHighlighter = (language: string): Highlighter | null => {
  // Get the languages that need to be loaded.
  const lang: string = languageNameMap[language] || language;
  const langsToLoad = [lang];

  // Doc language of current language.
  if (docLangMap[lang]) {
    langsToLoad.push(docLangMap[lang]);
  }

  // Try to load languages.
  loadLanguages(langsToLoad);

  // Return `null` if current language could not be loaded the doc language is not required so
  // we don't check it here.
  if (!languages[lang]) {
    return null;
  }

  return (code) => highlight(code, languages[lang], lang);
};
