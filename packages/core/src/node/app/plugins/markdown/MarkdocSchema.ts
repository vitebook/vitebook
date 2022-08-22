/* eslint-disable import/no-named-as-default-member */

import Markdoc, { type Config as MarkdocConfig } from '@markdoc/markdoc';
import { createFilter } from '@rollup/pluginutils';
import { globbySync } from 'globby';
import kleur from 'kleur';
import path from 'upath';

import { toPascalCase } from '../../../../shared';
import { logger, normalizePath } from '../../../utils';

const STRIP_MARKDOC_DIR_RE = /\/@markdoc\/.+/;

export type MarkdocSchemaConfig = {
  include: string[];
  exclude: (string | RegExp)[];
  dirs: {
    root: string;
    pages: string;
  };
};

export type MarkdocNodeFileMeta = {
  name: string;
  cname: string;
  type: 'node' | 'tag';
  inline: boolean;
  filePath: string;
  pagesPath: string;
  owningDir: string;
};

export class MarkdocSchema {
  protected nodes = new Map<string, MarkdocNodeFileMeta>();
  protected config!: MarkdocSchemaConfig;

  base: MarkdocConfig = {};

  /** Vite info set as Markdoc variables. */
  vite = { mode: '', env: {} };

  /** track files for HMR. */
  affectedFiles = new Map<string, Set<string>>();

  filter!: (id: string) => boolean;

  async configure(config: MarkdocSchemaConfig) {
    this.config = config;
    config.exclude.push(/\/_/, /@layout/);
    this.filter = createFilter(config.include, config.exclude);
  }

  async discover() {
    const filePaths = this.getFilePaths();
    await Promise.all(filePaths.map(this.addNode.bind(this)));
  }

  getFilePaths() {
    return globbySync(this.config.include, {
      absolute: true,
      cwd: this.config.dirs.pages,
    })
      .filter(this.filter)
      .map(normalizePath);
  }

  addNode(filePath: string) {
    const pagesPath = this.getPagesPath(filePath);

    const name = path
      .basename(pagesPath, path.extname(pagesPath))
      .replace('@node', '')
      .replace('@inline', '');

    const type = this.isNode(filePath) ? 'node' : 'tag';

    if (type === 'node' && !isValidMarkdownNodeName(name)) {
      const validValues = `${kleur.bold('Valid values')}: ${Array.from(
        getValidNodeNames(),
      )}`;

      logger.warn(
        `Invalid markdown node name [${kleur.bold(name)}]. \n\n${validValues}`,
      );
      return;
    }

    const cname = toPascalCase(name);
    const inline = /@inline/.test(pagesPath);
    const owningDir = path.dirname(
      filePath.replace(STRIP_MARKDOC_DIR_RE, '/root.md'),
    );

    this.nodes.set(pagesPath, {
      name,
      type,
      cname,
      filePath,
      pagesPath,
      inline,
      owningDir,
    });
  }

  removeNode(filePath: string) {
    const pagesPath = this.getPagesPath(filePath);
    this.nodes.delete(pagesPath);
  }

  isNode(filePath: string) {
    return this.isAnyNode(filePath) && filePath.includes('@node');
  }

  isTag(filePath: string) {
    return this.isAnyNode(filePath) && !filePath.includes('@node');
  }

  isAnyNode(filePath: string) {
    return filePath.includes('@markdoc') && this.filter(filePath);
  }

  resolveImports(filePath: string) {
    return this.getOwnedNodes(filePath, '*')
      .map((node) => {
        return `import ${node.cname} from "/${this.getRootPath(
          node.filePath,
        )}";`;
      })
      .filter(Boolean);
  }

  getConfig(pageFilePath: string): MarkdocConfig {
    const isPage = pageFilePath.startsWith(this.config.dirs.pages);
    const nodes = isPage ? this.getNodesConfig(pageFilePath) : {};
    const tags = isPage ? this.getTagsConfig(pageFilePath) : {};

    const config: MarkdocConfig = {
      ...this.base,
      variables: {
        ...this.base.variables,
        file: {
          ...this.base.variables?.file,
          path: pageFilePath,
        },
        vite: {
          ...this.base.variables?.vite,
          ...this.vite,
        },
      },
      nodes: {
        ...this.base.nodes,
        ...nodes,
      },
      tags: {
        import: {
          render: undefined,
          selfClosing: true,
          transform(node) {
            return new Markdoc.Tag('import', node.attributes);
          },
        },
        ...this.base.tags,
        ...tags,
      },
    };

    return config;
  }

  nodeBelongsTo(nodeFilePath: string, pageFilePath: string) {
    const nodePath = this.getPagesPath(nodeFilePath);
    const node = this.nodes.get(nodePath);
    return node && pageFilePath.startsWith(node.owningDir);
  }

  getOwnedNodes(pageFilePath: string, type: '*' | 'node' | 'tag') {
    return Array.from(this.nodes.values()).filter(
      (node) =>
        (type === '*' || node.type === type) &&
        this.nodeBelongsTo(node.filePath, pageFilePath),
    );
  }

  getNodesConfig(pageFilePath: string) {
    const nodes: MarkdocConfig['nodes'] = {};

    for (const node of this.getOwnedNodes(pageFilePath, 'node')) {
      nodes[node.name] = {
        render: node.cname,
        transform: (_node, config) => {
          return new Markdoc.Tag(
            node.cname,
            _node.attributes,
            _node.transformChildren(config),
          );
        },
      };

      this.markFileForHMR(node.filePath, pageFilePath);
    }

    return nodes;
  }

  getTagsConfig(pageFilePath: string) {
    const tags: MarkdocConfig['tags'] = {};

    for (const tag of this.getOwnedNodes(pageFilePath, 'tag')) {
      tags[tag.name] = {
        render: tag.cname,
        selfClosing: tag.inline,
        transform: (node, config) => {
          return new Markdoc.Tag(
            tag.cname,
            node.attributes,
            node.transformChildren(config),
          );
        },
      };

      this.markFileForHMR(tag.filePath, pageFilePath);
    }

    return tags;
  }

  markFileForHMR(nodeFilePath: string, pageFilePath: string) {
    this.affectedFiles.set(
      nodeFilePath,
      (this.affectedFiles.get(nodeFilePath) ?? new Set()).add(pageFilePath),
    );
  }

  protected getRootPath(filePath: string) {
    return path.relative(this.config.dirs.root, filePath);
  }

  protected getPagesPath(filePath: string) {
    return path.relative(this.config.dirs.pages, filePath);
  }
}

const validNodeNames = new Set([
  'document',
  'heading',
  'paragraph',
  'blockquote',
  'hr',
  'image',
  'fence',
  'tag',
  'list',
  'item',
  'table',
  'thead',
  'tbody',
  'tr',
  'td',
  'th',
  'inline',
  'strong',
  'em',
  's',
  'link',
  'code',
  'text',
  'hardbreak',
  'softbreak',
]);

export function getValidNodeNames() {
  return validNodeNames;
}

export function isValidMarkdownNodeName(name: string) {
  return validNodeNames.has(name);
}
