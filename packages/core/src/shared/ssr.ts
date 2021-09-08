import type { HeadConfig } from './types/HeadConfig';

export type VitebookSSRContext = {
  lang: string;
  head: HeadConfig[];
};
