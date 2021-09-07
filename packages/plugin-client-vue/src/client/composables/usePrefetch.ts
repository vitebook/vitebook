import { listen } from 'quicklink';
import { onMounted } from 'vue';

export function usePrefetch(): void {
  onMounted(() => {
    listen();
  });
}
