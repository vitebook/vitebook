<script>
  import clsx from 'clsx';

  export let disabled = false;
</script>

<button
  {disabled}
  class={clsx(
    'px-4 py-2 rounded-md',
    disabled
      ? 'bg-gray-500 dark:bg-gray-300 text-white dark:text-gray-800'
      : 'bg-indigo-500 dark:bg-yellow-500 text-white dark:text-black',
  )}>Click Me</button
>
