<script>
  export let disabled = false;
</script>

<button {disabled} on:click><slot /></button>
