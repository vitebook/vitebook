import type { VirtualPageAddonsModule } from '../shared';

declare module ':virtual/vitebook/addons' {
  declare const addons: VirtualPageAddonsModule['default'];
  export default addons;
}
