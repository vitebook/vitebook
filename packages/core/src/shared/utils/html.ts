const htmlEscapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;',
};

const htmlEscapeRegexp = /[&<>'"]/g;

/**
 * Escape html chars.
 */
export const htmlEscape = (str: string): string =>
  str.replace(htmlEscapeRegexp, (char) => htmlEscapeMap[char]);

const htmlUnescapeMap = {
  '&amp;': '&',
  '&#38;': '&',
  '&lt;': '<',
  '&#60;': '<',
  '&gt;': '>',
  '&#62;': '>',
  '&apos;': "'",
  '&#39;': "'",
  '&quot;': '"',
  '&#34;': '"',
};

const htmlUnescapeRegexp = /&(amp|#38|lt|#60|gt|#62|apos|#39|quot|#34);/g;

/**
 * Unescape html chars.
 */
export const htmlUnescape = (str: string): string =>
  str.replace(htmlUnescapeRegexp, (char) => htmlUnescapeMap[char]);
