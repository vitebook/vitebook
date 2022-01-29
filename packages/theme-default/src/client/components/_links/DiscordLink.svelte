<script>
  import DiscordIcon from ':virtual/vitebook/icons/brand-discord?raw';
  import { isString } from '@vitebook/core';
  import { localizedThemeConfig } from '../../stores/localizedThemeConfig';
  import BrandLink from './BrandLink.svelte';

  const defaultLabel = 'Discord';

  $: discord = $localizedThemeConfig.socials?.discord;
</script>

<BrandLink
  href={isString(discord) ? discord : discord?.link}
  label={isString(discord) ? defaultLabel : discord?.label ?? defaultLabel}
  platform="discord"
  hidden={!discord}
>
  <svelte:fragment slot="icon">
    {@html DiscordIcon}
  </svelte:fragment>
</BrandLink>
