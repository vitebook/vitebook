import type { PluginSimple } from 'markdown-it';

export const escapeCodePlugin: PluginSimple = (parser) => {
  const codeInlineRule = parser.renderer.rules.code_inline;
  parser.renderer.rules.code_inline = (...args) => {
    const token = args[0][args[1]];
    const html = codeInlineRule?.(...args) ?? token.content;
    return escapeChars(html);
  };

  const fenceRule = parser.renderer.rules.fence;
  parser.renderer.rules.fence = (...args) => {
    const token = args[0][args[1]];
    const html = fenceRule?.(...args) ?? token.content;
    return escapeChars(html);
  };
};

const CODE_TAG_CONTENT_RE = /(?:<code>)([\s\S]*)(?:<\/code>)/g;
const ESCAPE_RE = /(\n|\r)/g;

function escapeChars(html: string) {
  return html.replace(CODE_TAG_CONTENT_RE, (_, match) => {
    return `<code>${match.replace(ESCAPE_RE, () => {
      return '<br />';
    })}</code>`;
  });
}
