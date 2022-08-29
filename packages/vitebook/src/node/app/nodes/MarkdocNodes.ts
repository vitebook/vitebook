import kleur from 'kleur';
import path from 'node:path';

import { isString, type ServerFile, toPascalCase } from '../../../shared';
import { type App } from '../App';
import { FileNodes, type FileNodesCallbacks } from './FileNodes';

const STRIP_MARKDOC_DIR_RE = /\/@markdoc\/.+/;

export type MarkdocFileNode = ServerFile & {
  type: 'node' | 'tag';
  name: string;
  cname: string;
  inline: boolean;
  routePath: string;
  owningDir: string;
};

export class MarkdocNodes extends FileNodes<MarkdocFileNode> {
  init(app: App, options?: FileNodesCallbacks<MarkdocFileNode>) {
    return super.init(app, {
      include: app.config.markdown.nodes.include,
      exclude: app.config.markdown.nodes.exclude,
      ...options,
    });
  }

  async add(filePath: string) {
    filePath = this.normalizePath(filePath);

    const rootPath = this._getRootPath(filePath);
    const routePath = this._app.dirs.app.relative(filePath);

    const name = path.posix
      .basename(routePath, path.posix.extname(routePath))
      .replace('@node', '')
      .replace('@inline', '');

    const type = this.isNode(filePath) ? 'node' : 'tag';

    if (type === 'node' && !isValidMarkdownNodeName(name)) {
      const validValues = `${kleur.bold('Valid values')}: ${Array.from(
        getValidNodeNames(),
      )}`;

      this._app.logger.warn(
        `Invalid markdown node name [${kleur.bold(name)}]. \n\n${validValues}`,
      );
    }

    const cname = toPascalCase(name);
    const inline = /@inline/.test(routePath);
    const owningDir = path.posix.dirname(
      rootPath.replace(STRIP_MARKDOC_DIR_RE, '/root.md'),
    );

    const node: MarkdocFileNode = {
      name,
      type,
      cname,
      filePath,
      rootPath,
      routePath,
      inline,
      owningDir,
    };

    this._nodes.push(node);
    this._options.onAdd?.(node);

    return node;
  }

  isNode(filePath: string) {
    filePath = this.normalizePath(filePath);
    return this.isAnyNode(filePath) && filePath.includes('@node');
  }

  isTag(filePath: string) {
    filePath = this.normalizePath(filePath);
    return this.isAnyNode(filePath) && !filePath.includes('@node');
  }

  isAnyNode(filePath: string) {
    filePath = this.normalizePath(filePath);
    return filePath.includes('@markdoc') && this._filter(filePath);
  }

  isOwnedBy(node: string | MarkdocFileNode, ownerFilePath: string) {
    const rootPath = this._getRootPath(ownerFilePath);
    const _node = isString(node) ? this.find(node) : node;
    return _node && rootPath.startsWith(_node.owningDir);
  }

  getOwnedNodes(ownerFilePath: string, type: '*' | 'node' | 'tag') {
    return Array.from(this._nodes).filter(
      (node) =>
        (type === '*' || node.type === type) &&
        this.isOwnedBy(node, ownerFilePath),
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

function getValidNodeNames() {
  return validNodeNames;
}

function isValidMarkdownNodeName(name: string) {
  return validNodeNames.has(name);
}
