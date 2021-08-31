import type { App } from '../../App.js';
import type { Page } from '../../page/Page.js';

const HMR_CODE = `
if (import.meta.hot) {
  import.meta.hot.accept(({ data }) => {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  })
}
`;

/**
 * Generate page data temp file of a single page
 */
export const preparePageData = async (app: App, page: Page): Promise<void> => {
  // Page data file content.
  let content = `export const data = ${JSON.stringify(page.data, null, 2)}\n`;

  // Inject HMR code in dev.
  if (app.env.isDev) {
    content += HMR_CODE;
  }

  await app.dirs.tmp.write(page.dataFilePathRelative, content);
};
