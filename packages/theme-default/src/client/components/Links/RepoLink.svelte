<script>
  import { repoLink } from '../../stores/repoLink';
  import BrandLink from './BrandLink.svelte';

  const validPlatforms = ['GitHub', 'GitLab', 'Bitbucket'];

  let icon;

  $: isValidPlatform =
    $repoLink?.platform && validPlatforms.includes($repoLink.platform);

  function getIcon(platform) {
    if (!platform) return null;

    switch (platform) {
      case 'GitHub':
        return import('/:virtual/vitebook/icons/brand-github?raw');
      case 'GitLab':
        return import('/:virtual/vitebook/icons/brand-gitlab?raw');
      case 'Bitbucket':
        return import('/:virtual/vitebook/icons/brand-bitbucket?raw');
      default:
        return null;
    }
  }

  async function loadIcon(repoLink) {
    icon = await getIcon(repoLink?.platform);
  }

  $: loadIcon($repoLink);
</script>

<BrandLink
  href={$repoLink?.link}
  platform={$repoLink?.platform}
  label={$repoLink?.text}
  hidden={!$repoLink || !isValidPlatform}
>
  <svelte:fragment slot="icon">
    {@html icon?.default ?? ''}
  </svelte:fragment>
</BrandLink>
