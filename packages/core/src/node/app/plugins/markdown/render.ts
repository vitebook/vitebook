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

// We don't sanitize anything here because Svelte will do it anyway.
export function render(node: RenderableTreeNodes): string {
  if (typeof node === 'string') return node;

  if (Array.isArray(node)) return node.map(render).join('');

  if (node === null || typeof node !== 'object') return '';

  const { name, attributes, children = [] } = node;

  if (attributes?.__ignore) return '';

  if (!name) return render(children);

  let output = `<${name}`;

  const isComponent = name.charAt(0) === name.charAt(0).toUpperCase();

  if (isComponent) {
    for (const [k, v] of Object.entries(attributes ?? {}))
      if (typeof v === 'object' && '__render' in v) {
        output += ` ${v.__render()}`;
      } else {
        output += ` ${k}=${typeof v === 'string' ? `"${v}"` : `{${v}}`}`;
      }
  } else {
    for (const [k, v] of Object.entries(attributes ?? {}))
      output += ` ${k}="${String(v)}"`;
  }

  output += '>';

  if (voidElements.has(name)) return output;

  if (children.length) output += render(children);
  output += `</${name}>`;

  return output;
}
