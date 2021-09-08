import type { VueVirtualStoryAddonsModule } from '../client/types/addon';

declare module '@virtual/vitebook/plugin-story/addons' {
  declare const addons: VueVirtualStoryAddonsModule['default'];
  export default addons;
}
