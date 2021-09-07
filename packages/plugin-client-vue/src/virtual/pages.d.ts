import type { VirtualPagesModule } from '@vitebook/core';

declare module '@virtual/vitebook/core/pages' {
  declare const pages: VirtualPagesModule['default'];
  export default pages;
}
