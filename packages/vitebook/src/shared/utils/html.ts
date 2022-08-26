const escapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;',
};

const escapeHtmlRE = /[&<>'"]/g;

export function escapeHTML(str: string) {
  return str.replace(escapeHtmlRE, (char) => escapeMap[char]);
}

const unescapeMap = Object.fromEntries(
  Object.entries(escapeMap).map((entries) => entries.reverse()),
);

const unescapeHtmlRE = /&amp;|&lt;|&gt;|&#39;|&quot;/g;

export function unescapeHTML(str: string) {
  return str.replace(unescapeHtmlRE, (char) => unescapeMap[char]);
}
