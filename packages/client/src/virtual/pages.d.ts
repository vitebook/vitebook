import type { VirtualPagesModule } from '../client/types/page';

declare module '@virtual/vitebook/core/pages' {
  declare const pages: VirtualPagesModule['default'];
  export default pages;
}
