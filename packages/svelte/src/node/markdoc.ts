import path from 'node:path';
import {
  escapeHTML,
  Markdoc,
  type MarkdocConfig,
  type MarkdocRenderer,
  type MarkdocTag,
  type MarkdocTreeNodeTransformer,
  type MarkdocTreeWalkStuff,
  type RenderMarkdocConfig,
  renderMarkdocToHTML,
  toPascalCase,
} from 'vitebook/node';

export const svelteMarkdocTags: MarkdocConfig['tags'] = {
  head: {
    render: 'svelte:head',
  },
  fragment: {
    render: 'svelte:fragment',
    transform(node, config) {
      return new Markdoc.Tag(
        'svelte:fragment',
        node.attributes,
        node.transformChildren(config),
      );
    },
  },
  slot: {
    render: 'svelte:fragment',
    transform(node, config) {
      node.attributes.slot = node.attributes.name;
      delete node.attributes.name;
      return new Markdoc.Tag(
        'svelte:fragment',
        node.attributes,
        node.transformChildren(config),
      );
    },
  },
  component: {
    render: 'svelte:component',
    transform(node, config) {
      return new Markdoc.Tag(
        'svelte:component',
        node.attributes,
        node.transformChildren(config),
      );
    },
  },
};

// Care for strings that have been JSON stringified ("...")
const propRE = /^(?:"|\$obj::)/;
const objRE = /^\$obj::/;
const stripSlotWrapperRE = /<p><slot(.*?)\/?><\/p>/g;

const markObj = (name: string) => {
  return `$obj::${name}`;
};

const renderAttr: RenderMarkdocConfig['attr'] = (_, name, value) => {
  const isString = typeof value === 'string';
  return isString && !propRE.test(value)
    ? `${name}="${value}"`
    : `${name}={${isString ? value.replace(objRE, '') : value}}`;
};

export const renderMarkdoc: MarkdocRenderer = ({
  meta,
  content,
  imports,
  stuff,
}) => {
  let markup = renderMarkdocToHTML(content, { attr: renderAttr });

  markup = markup
    .substring('<article>'.length, markup.length - '</article>'.length)
    .replace(stripSlotWrapperRE, '<slot$1/>');

  const scriptModule = [
    '<script context="module">',
    `  export const __markdownMeta = ${JSON.stringify(meta)};`,
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
const svelteComponentNameRE = /^svelte:component$/;
const imgRE = /^img$/;

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
    } else if (svelteComponentNameRE.test(name)) {
      resoleSvelteComponent(node, stuff);
    } else if (imgRE.test(name)) {
      resolveImg(node, stuff);
    }
  }
};

function resolveImg(tag: MarkdocTag, stuff: MarkdocTreeWalkStuff) {
  const src = tag.attributes.src;

  const name = `${toPascalCase(
    path.posix.basename(src, path.posix.extname(src)),
  )}Image`;

  stuff.imports.add(`import ${name} from "${src}";`);

  tag.attributes.src = markObj(name);
}

function resolveSvelteHead(tag: MarkdocTag, stuff: MarkdocTreeWalkStuff) {
  tag.attributes.__ignore = true;
  if (typeof tag.children[0] === 'object') {
    if (Array.isArray(tag.children[0]?.children)) {
      stuff.head = tag.children[0]!.children.join('');
    }
  }
}

function resoleSvelteComponent(tag: MarkdocTag, stuff: MarkdocTreeWalkStuff) {
  const { file: filePath } = tag.attributes;

  const cname = toPascalCase(
    path.posix.basename(filePath, path.posix.extname(filePath)),
  );

  stuff.imports.add(`import ${cname} from "${filePath}";`);

  tag.name = cname;
  delete tag.attributes.file;
}

function escapeCodeContent(tag: MarkdocTag) {
  const isComponent = tag.name === 'Code';
  const code = isComponent ? tag.attributes.code : tag.children[0];

  if (typeof code === 'string') {
    if (isComponent) {
      tag.attributes.code = JSON.stringify(code);
    } else {
      tag.children[0] = htmlBlock(escapeHTML(code));
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
