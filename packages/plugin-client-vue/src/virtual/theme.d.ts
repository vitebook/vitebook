import type { VirtualVueThemeModule } from '../theme.js';

declare module '@virtual/vitebook/core/theme' {
  declare const theme: VirtualVueThemeModule['default'];
  export default theme;
}
