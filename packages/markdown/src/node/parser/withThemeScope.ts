import { HTMLElement, parse } from 'node-html-parser';

const COMPONENT_NAME_RE = /^[A-Z]/;

function walk(node: HTMLElement, scopeClass: string, apply = true) {
  for (let i = 0; i < node.childNodes.length; i += 1) {
    if (COMPONENT_NAME_RE.test(node.rawTagName)) {
      walk(node.childNodes[i] as HTMLElement, scopeClass, false);
    } else if (node.rawTagName?.startsWith('svelte:')) {
      walk(node.childNodes[i] as HTMLElement, scopeClass, true);
    } else if (/language-/.test(node.classList.toString())) {
      node.classList?.add(scopeClass);
      walk(node.childNodes[i] as HTMLElement, scopeClass, true);
    } else {
      if (apply) {
        node.classList?.add(scopeClass);
      }

      walk(node.childNodes[i] as HTMLElement, scopeClass, apply);
    }
  }
}

export function withThemeScope(html: string, scopeClass: string): string {
  const root = parse(html, { comment: true });
  walk(root, scopeClass);
  return root.toString();
}
