<script>
  import TwitterIcon from ':virtual/vitebook/icons/brand-twitter?raw';
  import { isString } from '@vitebook/core';
  import { localizedThemeConfig } from '../../stores/localizedThemeConfig';
  import BrandLink from './BrandLink.svelte';

  const defaultLabel = 'Twitter';

  $: twitter = $localizedThemeConfig.socials?.twitter;
</script>

<BrandLink
  href={isString(twitter) ? twitter : twitter?.link}
  label={isString(twitter) ? defaultLabel : twitter?.label ?? defaultLabel}
  platform="twitter"
  hidden={!twitter}
>
  <svelte:fragment slot="icon">
    {@html TwitterIcon}
  </svelte:fragment>
</BrandLink>
