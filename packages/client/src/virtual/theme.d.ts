import type { VirtualThemeModule } from '../shared/types/Theme';

declare module ':virtual/vitebook/theme' {
  declare const theme: VirtualThemeModule['default'];
  export default theme;
}
