import { VM_PREFIX } from '@vitebook/core/node';

export const VIRTUAL_VITEBOOK_ICONS_RE =
  /:virtual\/vitebook\/icons\/(.*)(\?.*)/;
export const VIRTUAL_ICONS_MODULE_ID = `${VM_PREFIX}/icons`;
export const VIRTUAL_EMPTY_ICON_MODULE_ID = `/${VM_PREFIX}/icons/empty`;

export type VitebookIcon =
  | 'menu'
  | 'menu-caret'
  | 'back-arrow'
  | 'edit-page'
  | 'forward-arrow'
  | 'external-link'
  | 'theme-switch-light'
  | 'theme-switch-dark'
  | `home-feature-${number}`
  | `brand-${string}`
  | `sidebar-file-${string}`
  | `sidebar-folder-open`
  | `sidebar-folder-closed`
  | `addon-${string}`;
