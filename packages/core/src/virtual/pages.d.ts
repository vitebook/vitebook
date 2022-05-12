import type { VirtualClientPagesModule } from '../shared/types/Page';

declare module ':virtual/vitebook/pages' {
  declare const pages: VirtualClientPagesModule['default'];
  export default pages;
}
