import { esmRequire } from '../../utils/module';

export const getAppVersion = (): string => {
  return esmRequire('@vitebook/core/package.json').version;
};
