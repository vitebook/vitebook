<script setup lang="ts">
import { useMarkdownPageMeta, usePage } from '@vitebook/client';
import { computed } from 'vue';

import EditPageIcon from ':virtual/vitebook/icons/edit-page';

import { defaultThemeLocaleOptions } from '../..';
import { useLocalizedThemeConfig } from '../../composables/useLocalizedThemeConfig';
import { resolveEditPageLink } from './resolveEditPageLink';

const page = usePage();
const pageMeta = useMarkdownPageMeta();
const theme = useLocalizedThemeConfig();

const isEnabled = computed(
  () =>
    pageMeta.value?.frontmatter.editLink ??
    theme.value.markdown?.editLink ??
    defaultThemeLocaleOptions.markdown.editLink
);

const editPageText = computed(
  () =>
    theme.value.markdown?.editLinkText ??
    defaultThemeLocaleOptions.markdown.editLinkText
);

const editPageLink = computed(() => {
  const repo =
    theme.value.markdown?.remoteGitRepo?.url ?? theme.value.remoteGitRepo?.url;

  if (!repo || !page.value) return null;

  return resolveEditPageLink({
    repo,
    branch: theme.value.markdown?.remoteGitRepo?.branch,
    dir: theme.value.markdown?.remoteGitRepo?.dir,
    relativeFilePath: page.value.rootPath,
    editLinkPattern: theme.value.markdown?.editLinkPattern
  });
});
</script>

<template>
  <p v-if="isEnabled && editPageLink" class="md-footer__edit-page">
    <a :href="editPageLink" target="_blank" class="md-footer__edit-page__link">
      <EditPageIcon /> {{ editPageText }}
    </a>
  </p>
</template>

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

.md-footer__edit-page__link svg {
  margin-right: 0.25rem;
}
</style>
