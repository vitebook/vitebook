<script>
  import clsx from 'clsx';

  export let disabled = false;
</script>

<button
  {disabled}
  class={clsx(
    'p-4 rounded-md text-gray-800',
    disabled ? 'bg-gray-300' : 'bg-yellow-500',
  )}>Click Me</button
>
