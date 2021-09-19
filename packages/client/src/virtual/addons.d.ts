import type { VirtualStoryAddonsModule } from '../client/types/addon';

declare module '@virtual/vitebook/plugin-story/addons' {
  declare const addons: VirtualStoryAddonsModule['default'];
  export default addons;
}
