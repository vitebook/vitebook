import MagicString from 'magic-string';

import type { App } from '../../App';
import type { Plugin } from '../Plugin';

export function ssrPlugin(): Plugin {
  let app: App;

  return {
    name: '@vitebook/ssr',
    enforce: 'post',
    vitebookInit(_app) {
      app = _app;
    },
    transform(code, id, { ssr } = {}) {
      if (
        ssr &&
        !id.includes('@vitebook/core') && // Can't self-import.
        !id.includes('packages/core/dist/client') && // Linked package.
        id.endsWith('.svelte')
      ) {
        const mcs = new MagicString(code);
        const matchRE = /export\sdefault\s(.*?);/;
        const match = code.match(matchRE);
        const componentName = match?.[1];

        if (!match || !componentName) return null;

        const start = code.search(match[0]);
        const end = start + match[0].length;

        const addModuleCode = `  __vitebook__getSSRContext().modules.add(${JSON.stringify(
          app.dirs.root.relative(id),
        )})`;

        mcs.overwrite(
          start,
          end,
          [
            "import { getSSRContext as __vitebook__getSSRContext } from '@vitebook/core';",
            `const $$render = ${componentName}.$$render;`,
            `${componentName}.$$render = function(...args) {`,
            addModuleCode,
            '  return $$render(...args)',
            '}',
            '',
            match[0],
          ].join('\n'),
        );

        return {
          code: mcs.toString(),
          map: mcs.generateMap({ source: id }).toString(),
        };
      }

      return null;
    },
  };
}
