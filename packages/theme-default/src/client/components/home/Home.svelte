<script>
  import HomeFeatures from './HomeFeatures.svelte';
  import HomeFooter from './HomeFooter.svelte';
  import HomeHero from './HomeHero.svelte';
</script>

<slot name="before-hero" />
<HomeHero />
<slot name="after-hero" />
<HomeFeatures />
<slot name="after-features" />
<HomeFooter />
<slot name="after-footer" />
