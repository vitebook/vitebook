import { removeLeadingSlash } from '../../../utils/path.js';
import type { App } from '../../App.js';

/**
 * Resolve rendered page html file path.
 */
export const resolvePageHtmlInfo = ({
  app,
  path: pagePath
}: {
  app: App;
  path: string;
}): {
  htmlFilePath: string;
  htmlFilePathRelative: string;
} => {
  // /foo.html -> foo.html
  // /foo/ -> foo/index.html
  const htmlFilePathRelative = removeLeadingSlash(
    decodeURI(pagePath.replace(/\/$/, '/index.html'))
  );
  const htmlFilePath = app.dirs.dest.resolve(htmlFilePathRelative);

  return {
    htmlFilePath,
    htmlFilePathRelative
  };
};
