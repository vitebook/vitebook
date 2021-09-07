import type { VirtualStoryAddonsModule } from '@vitebook/plugin-story';

declare module '@virtual/vitebook/plugin-story/addons' {
  declare const addons: VirtualStoryAddonsModule['default'];
  export default addons;
}
