<script>
  import { Component, currentRoute } from '@vitebook/client';
</script>

<main>
  <Component this={$currentRoute?.component} />
</main>
