import type { VirtualVuePagesModule } from '../client/types/page';

declare module '@virtual/vitebook/core/pages' {
  declare const pages: VirtualVuePagesModule['default'];
  export default pages;
}
