import kleur from 'kleur';
import path from 'node:path';
import { toPascalCase } from 'shared/utils/string';
import { isString } from 'shared/utils/unit';

import type { App } from '../App';
import {
  type SystemFileMeta,
  SystemFiles,
  type SystemFilesOptions,
} from './SystemFiles';

const STRIP_MARKDOC_DIR_RE = /\/\.markdoc\/.+/;

export type MarkdocFile = SystemFileMeta & {
  type: 'node' | 'tag';
  name: string;
  cname: string;
  inline: boolean;
  routePath: string;
  owningDir: string;
};

export class MarkdocFiles extends SystemFiles<MarkdocFile> {
  init(app: App, options?: Partial<SystemFilesOptions>) {
    return super.init(app, {
      include: app.config.markdown.nodes.include,
      exclude: app.config.markdown.nodes.exclude,
      ...options,
    });
  }

  async add(filePath: string) {
    filePath = this._normalizePath(filePath);

    const rootPath = this._getRootPath(filePath);
    const routePath = this._app.dirs.app.relative(filePath);
    const ext = this._ext(rootPath);
    const owningDir = path.posix.dirname(
      rootPath.replace(STRIP_MARKDOC_DIR_RE, '/root.md'),
    );

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

    const node: MarkdocFile = {
      name,
      type,
      cname,
      path: filePath,
      rootPath,
      ext,
      routePath,
      inline,
      owningDir,
    };

    this._files.push(node);
    this._callAddCallbacks(node);

    return node;
  }

  isNode(filePath: string) {
    filePath = this._normalizePath(filePath);
    return this.isAnyNode(filePath) && filePath.includes('@node');
  }

  isTag(filePath: string) {
    filePath = this._normalizePath(filePath);
    return this.isAnyNode(filePath) && !filePath.includes('@node');
  }

  isAnyNode(filePath: string) {
    filePath = this._normalizePath(filePath);
    return filePath.includes('@markdoc') && this._filter(filePath);
  }

  isOwnedBy(file: string | MarkdocFile, ownerFilePath: string) {
    const rootPath = this._getRootPath(ownerFilePath);
    const _node = isString(file) ? this.find(file) : file;
    return _node && rootPath.startsWith(_node.owningDir);
  }

  getOwnedNodes(ownerFilePath: string, type: '*' | 'node' | 'tag') {
    return Array.from(this._files).filter(
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
