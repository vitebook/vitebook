// eslint-disable-next-line import/default
import omit from 'just-omit';

import type { PageMeta } from '../types/PageMeta';

export function omitPageMeta<T extends Record<string, unknown>>(
  obj: T
): Omit<T, keyof PageMeta> {
  // @ts-expect-error - ?
  return omit(obj, ['title', 'description', 'head', 'locales']);
}
