import { isLinkExternal } from '@vitebook/core/shared';
import { computed, ComputedRef } from 'vue';

import type { NavItemLink } from '../../../shared';
import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';

export function useRepoLink(): ComputedRef<NavItemLink | null> {
  const theme = useLocalizedThemeConfig();
  return computed(() => {
    const { label, url } = theme.value.remoteGitRepo ?? {};

    if (!url) {
      return null;
    }

    const link = getRepoLink(url);
    const text = getRepoText(link, label);

    return { text, link };
  });
}

function getRepoLink(repo: string): string {
  return isLinkExternal(repo) ? repo : `https://github.com/${repo}`;
}

export const platforms = ['GitHub', 'GitLab', 'Bitbucket'].map((platform) => {
  return [platform, new RegExp(platform, 'i')] as const;
});

function getRepoText(url: string, label?: string): string {
  if (label) {
    return label;
  }

  // If no label is provided, deduce it from the repo url.
  const hosts = url.match(/^https?:\/\/[^/]+/);

  if (!hosts) {
    return 'Source';
  }

  const platform = platforms.find(([, re]) => re.test(hosts[0]));

  if (platform && platform[0]) {
    return platform[0];
  }

  return 'Source';
}
