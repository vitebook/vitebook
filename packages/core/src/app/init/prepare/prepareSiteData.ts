import type { App } from '../../App.js';

const HMR_CODE = `
if (import.meta.hot) {
  import.meta.hot.accept(({ siteData }) => {
    __VUE_HMR_RUNTIME__.updateSiteData(siteData)
  })
}
`;

/**
 * Generate site data temp file
 */
export const prepareSiteData = async (app: App): Promise<void> => {
  let content = `\
export const siteData = ${JSON.stringify(app.options.site, null, 2)}
`;

  // Inject HMR code in dev.
  if (app.env.isDev) {
    content += HMR_CODE;
  }

  await app.dirs.tmp.write('internal/siteData.js', content);
};
