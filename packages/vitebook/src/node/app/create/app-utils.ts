import { esmRequire } from '../../utils/module';

export const getAppVersion = (): string => {
  return esmRequire()('vitebook/package.json').version;
};
