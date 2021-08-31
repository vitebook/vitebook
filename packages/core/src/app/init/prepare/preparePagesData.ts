import type { App } from '../../App.js';

/**
 * Generate page path to page data map temp file
 */
export const preparePagesData = async (app: App): Promise<void> => {
  // Generate page data map.
  const content = `\
export const pagesData = {\
${app.pages
  .map(
    ({ key, path, dataFilePath }) => `
  // path: ${path}
  ${JSON.stringify(key)}: () => import(${JSON.stringify(
      dataFilePath
    )}).then(({ data }) => data),`
  )
  .join('')}
}
`;

  await app.dirs.tmp.write('internal/pagesData.js', content);
};
