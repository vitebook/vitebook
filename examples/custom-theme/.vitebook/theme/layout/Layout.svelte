<script>
  import { Component, currentPage, currentRoute } from '@vitebook/client';

  $: hasShadowRoot = $currentPage?.type
    ? !/(^md|:md)$/.test($currentPage.type ?? '')
    : false;
</script>

<main>
  <Component this={$currentRoute?.component} shadow={hasShadowRoot} />
</main>
