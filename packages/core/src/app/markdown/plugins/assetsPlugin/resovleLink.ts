import { decode } from 'mdurl';

import { path } from '../../../../utils/path.js';
import type { MarkdownEnv } from '../../Markdown.js';

export const resolveLink = (
  link: string,
  relativePathPrefix: string,
  env: MarkdownEnv
): string => {
  // Decode link to ensure bundler can find the file correctly.
  let resolvedLink = decode(link);

  // If the link is a relative path, and the `env.filePathRelative` exists, then add `@source`
  // alias to the link.
  if (/^\.{1,2}\//.test(link) && env.filePathRelative) {
    resolvedLink = `${relativePathPrefix}/${path.join(
      path.dirname(env.filePathRelative),
      resolvedLink
    )}`;
  }

  return resolvedLink;
};
