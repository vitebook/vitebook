import { esmRequire } from '../../utils/module.js';

export const getAppVersion = (): string => {
  return esmRequire('@vitebook/core/package.json').version;
};
