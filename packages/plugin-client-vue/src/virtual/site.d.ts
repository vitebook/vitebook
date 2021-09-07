import type { VirtualSiteDataModule } from '@vitebook/core';

declare module '@virtual/vitebook/core/site' {
  declare const options: VirtualSiteDataModule['default'];
  export default options;
}
