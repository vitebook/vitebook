import type { VirtualSiteDataModule } from '@vitebook/core';

declare module ':virtual/vitebook/site' {
  declare const options: VirtualSiteDataModule['default'];
  export default options;
}
