import { onMounted } from 'vue';

export function usePrefetch(): void {
  onMounted(() => {
    // TODO: add `quicklink` alternative for Vue.
    // @see https://github.com/GoogleChromeLabs/quicklink
    // @see https://github.com/vuejs/vitepress/blob/main/src/client/app/composables/preFetch.ts
  });
}
