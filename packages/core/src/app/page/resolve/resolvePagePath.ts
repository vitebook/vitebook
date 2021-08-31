import { logger } from '../../../utils/logger.js';
import { ensureEndingSlash } from '../../../utils/path.js';
import type { PageOptions } from '../Page.js';

/**
 * Resolve the final route path of a page.
 */
export const resolvePagePath = ({
  permalink,
  pathInferred,
  options
}: {
  permalink: string | null;
  pathInferred: string | null;
  options: PageOptions;
}): string => {
  let pagePath = options.path || permalink || pathInferred;

  if (!pagePath) {
    throw logger.createError(
      `page path is empty, page options: ${JSON.stringify(options)}`
    );
  }

  if (!pagePath.endsWith('.html')) {
    pagePath = ensureEndingSlash(pagePath);
  }

  return encodeURI(pagePath);
};
