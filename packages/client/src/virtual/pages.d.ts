import type { VirtualPagesModule } from '../shared/types/Page';

declare module ':virtual/vitebook/pages' {
  declare const pages: VirtualPagesModule['default'];
  export default pages;
}
