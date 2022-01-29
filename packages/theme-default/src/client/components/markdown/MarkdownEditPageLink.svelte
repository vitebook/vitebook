<script>
  import EditPageIcon from ':virtual/vitebook/icons/edit-page?raw';
  import { currentMarkdownPageMeta, currentPage } from '@vitebook/client';
  import { defaultThemeLocaleOptions } from '../../../shared';
  import { localizedThemeConfig } from '../../stores/localizedThemeConfig';
  import { resolveEditPageLink } from './resolveEditPageLink';

  let editPageLink = null;

  $: isEnabled =
    $currentMarkdownPageMeta?.frontmatter.editLink ??
    $localizedThemeConfig.markdown?.editLink ??
    defaultThemeLocaleOptions.markdown.editLink;

  $: editPageText =
    $localizedThemeConfig.markdown?.editLinkText ??
    defaultThemeLocaleOptions.markdown.editLinkText;

  $: {
    const repo =
      $localizedThemeConfig.markdown?.remoteGitRepo?.url ??
      $localizedThemeConfig.remoteGitRepo?.url;

    editPageLink =
      repo && $currentPage
        ? resolveEditPageLink({
            repo,
            branch: $localizedThemeConfig.markdown?.remoteGitRepo?.branch,
            dir: $localizedThemeConfig.markdown?.remoteGitRepo?.dir,
            relativeFilePath: $currentPage.rootPath,
            editLinkPattern: $localizedThemeConfig.markdown?.editLinkPattern
          })
        : null;
  }
</script>

{#if isEnabled && editPageLink}
  <p class="md-footer__edit-page">
    <a href={editPageLink} target="_blank" class="md-footer__edit-page__link">
      <span class="md-footer__edit-page__link__icon">
        {@html EditPageIcon}
      </span>
      {editPageText}
    </a>
  </p>
{/if}

<style>
  .md-footer__edit-page {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .md-footer__edit-page__link {
    display: flex;
    align-items: center;
  }

  .md-footer__edit-page__link__icon {
    display: inline-block;
    margin-right: 0.25rem;
  }
</style>
