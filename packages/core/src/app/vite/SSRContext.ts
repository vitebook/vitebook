import type { HeadConfig } from '../site/HeadConfig.js';

export type VitebookSSRContext = {
  lang: string;
  head: HeadConfig[];
};
