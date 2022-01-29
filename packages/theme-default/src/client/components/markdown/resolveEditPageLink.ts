import {
  isLinkHttp,
  removeEndingSlash,
  removeLeadingSlash,
} from '@vitebook/core';

import { RepoType, resolveRepoType } from './resolveRepoType';

export const editPageLinkPatterns: Record<Exclude<RepoType, null>, string> = {
  GitHub: ':repo/edit/:branch/:path',
  GitLab: ':repo/-/edit/:branch/:path',
  Bitbucket:
    ':repo/src/:branch/:path?mode=edit&spa=0&at=:branch&fileviewer=file-view-default',
};

export const resolveEditPageLink = ({
  repo,
  branch = 'main',
  dir = '',
  relativeFilePath,
  editLinkPattern,
}: {
  repo: string;
  branch?: string;
  dir?: string;
  relativeFilePath: string;
  editLinkPattern?: string;
}): string | null => {
  const repoType = resolveRepoType(repo);

  let pattern: string | undefined;

  if (editLinkPattern) {
    pattern = editLinkPattern;
  } else if (repoType !== null) {
    pattern = editPageLinkPatterns[repoType];
  }

  if (!pattern) return null;

  return pattern
    .replace(/:repo/, isLinkHttp(repo) ? repo : `https://github.com/${repo}`)
    .replace(/:branch/, removeLeadingSlash(removeEndingSlash(branch)))
    .replace(
      /:path/,
      removeLeadingSlash(
        `${removeEndingSlash(dir)}/${removeLeadingSlash(relativeFilePath)}`,
      ),
    );
};
