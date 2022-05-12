import type { VirtualClientPageLayoutsModule } from '../shared/types/Page';

declare module ':virtual/vitebook/layouts' {
  declare const layouts: VirtualClientPageLayoutsModule['default'];
  export default layouts;
}
