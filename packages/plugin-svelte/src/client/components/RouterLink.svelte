<script>
  import { getContext } from 'svelte';

  import { ROUTER_CONTEXT_KEY } from '../context';

  export let to = '';
  export let replace = false;

  const router = getContext(ROUTER_CONTEXT_KEY);

  function handlePointerdown() {
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Enter') {
      handlePointerdown();
    }
  }
</script>

<a
  href={to}
  {...$$restProps}
  on:click|preventDefault
  on:pointerdown={handlePointerdown}
  on:keydown={handleKeydown}><slot /></a
>
