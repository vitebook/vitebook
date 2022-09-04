import { esmRequire } from 'node/utils/module';

export const getAppVersion = (): string => {
  return esmRequire()('vitebook/package.json').version;
};
