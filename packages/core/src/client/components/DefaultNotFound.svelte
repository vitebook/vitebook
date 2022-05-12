<script>
  const DEV = import.meta.env.DEV;
</script>

{#if DEV}
  <p>Add <code>pages/404.md</code> to customize this page.</p>
{:else}
  <p>Page Not Found</p>
{/if}
