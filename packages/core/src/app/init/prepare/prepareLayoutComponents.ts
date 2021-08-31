import type { App } from '../../App.js';

/**
 * Generate layout components temp file.
 */
export const prepareLayoutComponents = async (app: App): Promise<void> => {
  const content = `\
import { defineAsyncComponent } from 'vue'

export const layoutComponents = {\
${Object.entries(app.layouts)
  .map(
    ([name, path]) => `
  ${JSON.stringify(name)}: defineAsyncComponent(() => import(${JSON.stringify(
      path
    )})),`
  )
  .join('')}
}
`;

  await app.dirs.tmp.write('internal/layoutComponents.js', content);
};
