import { derived } from 'svelte/store';

import { localizedSiteOptions } from './localizedSiteOptions';

export const siteLang = derived(localizedSiteOptions, (site) => site.lang);
