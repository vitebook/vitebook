import { resolveLocalePath } from '../../../utils/locale.js';
import { ensureLeadingSlash } from '../../../utils/path.js';
import type { App } from '../../App.js';

/**
 * Infer page path according to file path.
 */
export const inferPagePath = ({
  app,
  filePathRelative
}: {
  app: App;
  filePathRelative: string | null;
}): {
  pathInferred: string | null;
  pathLocale: string;
} => {
  if (!filePathRelative) {
    return {
      pathInferred: null,
      pathLocale: '/'
    };
  }

  // Infer page route path from file path: foo/bar.md -> /foo/bar.html
  const pathInferred = ensureLeadingSlash(filePathRelative)
    .replace(/\.md$/, '.html')
    .replace(/\/(README|index).html$/i, '/');

  // Resolve page locale path.
  const pathLocale = resolveLocalePath(app.site.options.locales, pathInferred);

  return {
    pathInferred,
    pathLocale
  };
};
