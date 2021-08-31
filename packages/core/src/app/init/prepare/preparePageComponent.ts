import { isMarkdownPage } from '../../../utils/page.js';
import type { App } from '../../App.js';
import type { Page } from '../../page/Page.js';

/**
 * Generate page component temp file of a single page.
 */
export const preparePageComponent = async (
  app: App,
  page: Page
): Promise<void> => {
  if (!isMarkdownPage(page)) return;

  await app.dirs.tmp.write(
    page.componentFilePathRelative,
    [
      // take the rendered markdown content as <template>
      `<template>${page.contentRendered}</template>\n`,
      // hoist `<script>`, `<style>` and other custom blocks
      ...page.hoistedTags
    ].join('\n')
  );
};
