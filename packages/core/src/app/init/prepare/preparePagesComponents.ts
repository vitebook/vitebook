import type { App } from '../../App.js';

/**
 * Generate page key to page component map temp file
 */
export const preparePagesComponents = async (app: App): Promise<void> => {
  // Generate page component map file.
  const content = `\
import { defineAsyncComponent } from 'vue'

export const pagesComponents = {\
${app.pages
  .map(
    ({ key, path, componentFilePath }) => `
  // path: ${path}
  ${JSON.stringify(key)}: defineAsyncComponent(() => import(${JSON.stringify(
      componentFilePath
    )})),`
  )
  .join('')}
}
`;

  await app.dirs.tmp.write('internal/pagesComponents.js', content);
};
