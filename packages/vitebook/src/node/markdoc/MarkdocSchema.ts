/* eslint-disable import/no-named-as-default-member */

import Markdoc, { type Config as MarkdocConfig } from '@markdoc/markdoc';
import type { App } from 'node/app/App';
import type { MarkdocFiles } from 'node/app/files';

export class MarkdocSchema {
  protected _app!: App;
  protected _files!: MarkdocFiles;

  /** track files for HMR. */
  hmrFiles = new Map<string, Set<string>>();

  init(app: App) {
    this._app = app;
    this._files = app.files.markdoc;
  }

  getOwnedConfig(ownerFilePath: string): MarkdocConfig {
    const base = this._app.config.markdown.markdoc;
    const isPage = this._app.files.pages.is(ownerFilePath);
    const nodes = isPage ? this._getOwnedNodesConfig(ownerFilePath) : {};
    const tags = isPage ? this._getOwnedTagsConfig(ownerFilePath) : {};

    const config: MarkdocConfig = {
      ...base,
      variables: {
        ...base.variables,
        file: {
          ...base.variables?.file,
          path: ownerFilePath,
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

  resolveOwnedImports(ownerFilePath: string) {
    return this._files
      .getOwnedNodes(ownerFilePath, '*')
      .map((node) => {
        const rootPath = this._app.dirs.root.relative(node.filePath);
        return `import ${node.cname} from "/${rootPath}";`;
      })
      .filter(Boolean);
  }

  protected _getOwnedNodesConfig(ownerFilePath: string) {
    const nodes: MarkdocConfig['nodes'] = {};

    for (const node of this._files.getOwnedNodes(ownerFilePath, 'node')) {
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

      this._markFileForHMR(node.filePath, ownerFilePath);
    }

    return nodes;
  }

  protected _getOwnedTagsConfig(ownerFilePath: string) {
    const tags: MarkdocConfig['tags'] = {};

    for (const tag of this._files.getOwnedNodes(ownerFilePath, 'tag')) {
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

      this._markFileForHMR(tag.filePath, ownerFilePath);
    }

    return tags;
  }

  protected _markFileForHMR(nodeFilePath: string, ownerFilePath: string) {
    this.hmrFiles.set(
      nodeFilePath,
      (this.hmrFiles.get(nodeFilePath) ?? new Set()).add(ownerFilePath),
    );
  }
}
