import debug from 'debug';

import { fs } from '../../../utils/fs.js';
import type { PageOptions } from '../Page.js';
import { PageType } from '../PageType.js';

const log = debug('vitebook:core/page');

/**
 * Resolve page file content according to `filePath` or `options` content.
 */
export const resolvePageFileContent = async ({
  filePath,
  options
}: {
  filePath: string | null;
  options: PageOptions;
}): Promise<string> => {
  if (filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } catch (e) {
      log((e as Error).message);
    }
  }

  return (
    (options.type === PageType.Markdown ? options.content : undefined) ?? ''
  );
};
