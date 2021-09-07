import type { HeadConfig } from '../site/HeadConfig.js';

export type VitebookSsrContext = {
  lang: string;
  head: HeadConfig[];
};
