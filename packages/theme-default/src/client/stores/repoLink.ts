import { isLinkExternal } from '@vitebook/client';
import { derived } from 'svelte/store';

import { localizedThemeConfig } from './localizedThemeConfig';

export const repoLink = derived(localizedThemeConfig, (theme) => {
  const { label, url } = theme.remoteGitRepo ?? {};

  if (!url) {
    return null;
  }

  const link = getRepoLink(url);
  const text = getRepoText(link, label);

  return { text, link };
});

export function getRepoLink(repo: string): string {
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
