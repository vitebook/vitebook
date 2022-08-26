import MagicString from 'magic-string';
import type { App, VitebookPlugin } from 'vitebook/node';

const SVELTE_FILE_RE = /\.svelte($|\/)/;

export function svelteSSRPlugin(): VitebookPlugin {
  let app: App;

  return {
    name: '@vitebook/ssr',
    enforce: 'post',
    vitebook: {
      enforce: 'post',
      configureApp(_app) {
        app = _app;
      },
    },
    transform(code, id, { ssr } = {}) {
      if (
        ssr &&
        !id.includes('@vitebook/svelte') && // Can't self-import.
        !id.includes('packages/svelte/dist/client') && // Linked package.
        SVELTE_FILE_RE.test(id)
      ) {
        const mcs = new MagicString(code);
        const matchRE = /export\sdefault\s(.*?);/;
        const match = code.match(matchRE);
        const componentName = match?.[1];

        if (!match || !componentName) return null;

        const start = code.search(match[0]);
        const end = start + match[0].length;

        const addModuleCode = `  __vitebook__getServerContext().modules.add(${JSON.stringify(
          app.dirs.root.relative(id),
        )})`;

        mcs.overwrite(
          start,
          end,
          [
            "import { getServerContext as __vitebook__getServerContext } from '@vitebook/svelte';",
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
