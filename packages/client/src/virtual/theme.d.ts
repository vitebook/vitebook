import type { VirtualClientThemeModule } from '../shared';

declare module ':virtual/vitebook/theme' {
  declare const theme: VirtualClientThemeModule['default'];
  export default theme;
}
