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
  const platform = getRepoPlatform(link) ?? getRepoPlatform(label ?? '');

  return { text, link, platform };
});

export function getRepoLink(repo: string): string {
  return isLinkExternal(repo) ? repo : `https://github.com/${repo}`;
}

export function getRepoPlatform(text: string) {
  const platform = platforms.find(([, re]) => re.test(text));
  return platform?.[0];
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

  const platform = getRepoPlatform(hosts[0]);
  if (platform) return platform;

  return 'Source';
}
