import {
  escapeHtml,
  type MarkdocRenderer,
  type MarkdocTag,
  type MarkdocTreeNodeTransformer,
  type MarkdocTreeWalkStuff,
  RenderMarkdocConfig,
  renderMarkdocToHTML,
} from '@vitebook/core/node';

export const svelteMarkdocTags = {
  svelte_head: {
    render: 'svelte:head',
  },
};

const renderAttr: RenderMarkdocConfig['attr'] = (_, name, value) =>
  // Care for strings that have been JSON stringified
  typeof value === 'string' && !value.startsWith('"')
    ? `${name}="${value}"`
    : `${name}={${value}}`;

export const renderMarkdoc: MarkdocRenderer = ({
  meta,
  content,
  imports,
  stuff,
}) => {
  const markup = renderMarkdocToHTML(content, { attr: renderAttr });

  const scriptModule = [
    '<script context="module">',
    `  export const meta = ${JSON.stringify(meta)};`,
    '</script>',
  ].join('\n');

  const script =
    imports.length > 0 ? ['<script>', ...imports, '</script>'].join('\n') : '';

  const svelteHead = stuff.head
    ? `<svelte:head>\n${stuff.head}\n</svelte:head>\n\n`
    : '';

  return `${scriptModule}\n\n${script}\n\n${svelteHead}\n\n${markup}`;
};

const codeNameRE = /^(code|Code)$/;
const fenceNameRE = /^(pre|Fence)$/;
const svelteHeadNameRE = /^svelte:head$/;

export const transformTreeNode: MarkdocTreeNodeTransformer = ({
  node,
  stuff,
}) => {
  if (node && typeof node !== 'string') {
    const name = node.name;

    if (codeNameRE.test(name)) {
      escapeCodeContent(node);
    } else if (fenceNameRE.test(name)) {
      escapeFenceContent(node);
    } else if (svelteHeadNameRE.test(name)) {
      resolveSvelteHead(node, stuff);
    }
  }
};

function resolveSvelteHead(tag: MarkdocTag, stuff: MarkdocTreeWalkStuff) {
  tag.attributes.__ignore = true;
  if (typeof tag.children[0] === 'object') {
    if (Array.isArray(tag.children[0]?.children)) {
      stuff.head = tag.children[0]!.children.join('');
    }
  }
}

function escapeCodeContent(tag: MarkdocTag) {
  const isComponent = tag.name === 'Code';
  const code = isComponent ? tag.attributes.code : tag.children[0];

  if (typeof code === 'string') {
    if (isComponent) {
      tag.attributes.code = JSON.stringify(code);
    } else {
      tag.children[0] = htmlBlock(escapeHtml(code));
    }
  }
}

function escapeFenceContent(tag: MarkdocTag) {
  const isComponent = tag.name === 'Fence';
  const code = isComponent ? tag.attributes.code : tag.children[0];
  const highlightedCode = tag.attributes.highlightedCode;

  if (isComponent) {
    tag.attributes.code = JSON.stringify(code);

    if (highlightedCode) {
      tag.attributes.highlightedCode = JSON.stringify(highlightedCode);
    }
  } else {
    tag.children[0] = htmlBlock(code);
  }
}

function htmlBlock(html: string) {
  return `{@html ${JSON.stringify(html)}}`;
}
