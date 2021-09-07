import type { HeadConfig } from '../../shared/index.js';

export type VitebookSsrContext = {
  lang: string;
  head: HeadConfig[];
};
