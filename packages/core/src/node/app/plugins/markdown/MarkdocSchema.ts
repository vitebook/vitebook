/* eslint-disable import/no-named-as-default-member */

import Markdoc, { type Config as MarkdocConfig } from '@markdoc/markdoc';
import { createFilter } from '@rollup/pluginutils';
import { globbySync } from 'globby';
import kleur from 'kleur';
import path from 'upath';

import { toPascalCase } from '../../../../shared';
import { logger, normalizePath } from '../../../utils';
import { type App } from '../../App';

const STRIP_MARKDOC_DIR_RE = /\/@markdoc\/.+/;

export type MarkdocNodeFileMeta = {
  name: string;
  cname: string;
  type: 'node' | 'tag';
  inline: boolean;
  filePath: string;
  routePath: string;
  owningDir: string;
};

export class MarkdocSchema {
  protected _app!: App;
  protected _nodes = new Map<string, MarkdocNodeFileMeta>();
  protected _filter!: (id: string) => boolean;

  /** track files for HMR. */
  affectedFiles = new Map<string, Set<string>>();

  async init(app: App) {
    this._app = app;
    this._filter = createFilter(
      app.config.markdown.nodes.include,
      app.config.markdown.nodes.exclude,
    );

    await this.discover();
  }

  async discover() {
    const filePaths = this.getFilePaths();
    await Promise.all(filePaths.map(this.addNode.bind(this)));
  }

  getFilePaths() {
    return globbySync(this._app.config.markdown.nodes.include, {
      absolute: true,
      cwd: this._app.dirs.app.path,
    })
      .filter(this._filter)
      .map(normalizePath);
  }

  addNode(filePath: string) {
    const routePath = this._app.dirs.app.relative(filePath);

    const name = path
      .basename(routePath, path.extname(routePath))
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
    const inline = /@inline/.test(routePath);
    const owningDir = path.dirname(
      filePath.replace(STRIP_MARKDOC_DIR_RE, '/root.md'),
    );

    this._nodes.set(routePath, {
      name,
      type,
      cname,
      filePath,
      routePath: routePath,
      inline,
      owningDir,
    });
  }

  removeNode(filePath: string) {
    const routePath = this._app.dirs.app.relative(filePath);
    this._nodes.delete(routePath);
  }

  isNode(filePath: string) {
    return this.isAnyNode(filePath) && filePath.includes('@node');
  }

  isTag(filePath: string) {
    return this.isAnyNode(filePath) && !filePath.includes('@node');
  }

  isAnyNode(filePath: string) {
    return filePath.includes('@markdoc') && this._filter(filePath);
  }

  resolveImports(filePath: string) {
    return this.getPageOwnedNodes(filePath, '*')
      .map((node) => {
        const rootPath = this._app.dirs.root.relative(node.filePath);
        return `import ${node.cname} from "/${rootPath}";`;
      })
      .filter(Boolean);
  }

  getPageConfig(pageFilePath: string): MarkdocConfig {
    const base = this._app.config.markdown.markdoc;
    const isPage = this._app.routes.isPage(pageFilePath);
    const nodes = isPage ? this.getPageNodesConfig(pageFilePath) : {};
    const tags = isPage ? this.getPageTagsConfig(pageFilePath) : {};

    const config: MarkdocConfig = {
      ...base,
      variables: {
        ...base.variables,
        file: {
          ...base.variables?.file,
          path: pageFilePath,
        },
        vite: {
          ...base.variables?.vite,
          mode: this._app.vite.resolved!.mode,
          env: this._app.vite.resolved!.env,
        },
      },
      nodes: {
        ...base.nodes,
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
        ...base.tags,
        ...tags,
      },
    };

    return config;
  }

  doesNodeBelongToPage(nodeFilePath: string, pageFilePath: string) {
    const nodePath = this._app.dirs.app.relative(nodeFilePath);
    const node = this._nodes.get(nodePath);
    return node && pageFilePath.startsWith(node.owningDir);
  }

  getPageOwnedNodes(pageFilePath: string, type: '*' | 'node' | 'tag') {
    return Array.from(this._nodes.values()).filter(
      (node) =>
        (type === '*' || node.type === type) &&
        this.doesNodeBelongToPage(node.filePath, pageFilePath),
    );
  }

  getPageNodesConfig(pageFilePath: string) {
    const nodes: MarkdocConfig['nodes'] = {};

    for (const node of this.getPageOwnedNodes(pageFilePath, 'node')) {
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

  getPageTagsConfig(pageFilePath: string) {
    const tags: MarkdocConfig['tags'] = {};

    for (const tag of this.getPageOwnedNodes(pageFilePath, 'tag')) {
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
