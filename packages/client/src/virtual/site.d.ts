import type { VirtualSiteDataModule } from '@vitebook/core/shared';

declare module '@virtual/vitebook/core/site' {
  declare const options: VirtualSiteDataModule['default'];
  export default options;
}
