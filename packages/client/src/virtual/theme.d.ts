import type { VirtualVueThemeModule } from '../client/types/theme';

declare module '@virtual/vitebook/core/theme' {
  declare const theme: VirtualVueThemeModule['default'];
  export default theme;
}
