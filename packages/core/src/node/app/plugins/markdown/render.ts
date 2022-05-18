import { type RenderableTreeNodes } from '@markdoc/markdoc';

// HTML elements that do not have a matching close tag
// Defined in the HTML standard: https://html.spec.whatwg.org/#void-elements
const voidElements = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

export type RenderMarkdocConfig = {
  attr?: (tagName: string, name: string, value: unknown) => string;
};

/**
 * Renders Markdoc to HTML tree.
 */
export function renderMarkdocToHTML(
  node: RenderableTreeNodes,
  config: RenderMarkdocConfig = {},
): string {
  if (typeof node === 'string') return node;

  if (Array.isArray(node))
    return node.map((n) => renderMarkdocToHTML(n, config)).join('');

  if (node === null || typeof node !== 'object') return '';

  const { name, attributes, children = [] } = node;

  if (attributes?.__ignore) return '';

  if (!name) return renderMarkdocToHTML(children, config);

  let output = `<${name}`;

  const attr = config.attr
    ? (k, v) => config.attr!(name, k, v)
    : (k, v) => `${k}="${String(v)}"`;

  for (const [k, v] of Object.entries(attributes ?? {})) {
    output += ` ${attr(k, v)}`;
  }

  output += '>';

  if (voidElements.has(name)) return output;

  if (children.length) output += renderMarkdocToHTML(children, config);
  output += `</${name}>`;

  return output;
}
