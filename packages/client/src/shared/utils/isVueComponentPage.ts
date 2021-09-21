import type { Page } from '@vitebook/core/shared';

import type { VueComponentPage } from '../types/VueComponentPage';

export function isVueComponentPage(page?: Page): page is VueComponentPage {
  return page?.type === 'vue';
}
