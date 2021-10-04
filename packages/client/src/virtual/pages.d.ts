import type { VirtualClientPagesModule } from '../shared';

declare module ':virtual/vitebook/pages' {
  declare const pages: VirtualClientPagesModule['default'];
  export default pages;
}
