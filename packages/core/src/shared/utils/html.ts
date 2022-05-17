const escapeHtmlMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;',
};

const escapeHtmlRE = /[&<>'"]/g;

export function escapeHtml(str: string) {
  return str.replace(escapeHtmlRE, (char) => escapeHtmlMap[char]);
}
