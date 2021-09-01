import type { HeadConfig } from '../../app/site/HeadConfig.js';

export type VitebookSSRContext = {
  lang: string;
  head: HeadConfig[];
};
