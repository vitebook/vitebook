import { HTMLElement, parse } from 'node-html-parser';

const COMPONENT_NAME_RE = /^[A-Z]/;

function walk(node: HTMLElement, scopeClass: string) {
  if (!COMPONENT_NAME_RE.test(node.rawTagName)) {
    node.classList?.add(scopeClass);
    for (let i = 0; i < node.childNodes.length; i += 1) {
      walk(node.childNodes[i] as HTMLElement, scopeClass);
    }
  }
}

export function withThemeScope(html: string, scopeClass: string): string {
  const root = parse(html);
  walk(root, scopeClass);
  return root.toString();
}
